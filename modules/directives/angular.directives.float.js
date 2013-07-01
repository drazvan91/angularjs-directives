'use strict';
angular.module("angular.directives.float", []).directive("float", function(){
	function removeViewFormat(value, group_sep, dec_sep){
		if(group_sep !== ''){
			value = value.toString().replace(new RegExp(group_sep, 'g'), '');
		}
		if(dec_sep !== '.'){
			value = value.toString().replace(new RegExp(dec_sep, 'g'), '.');
		}
		return value;
	}

	function applyFormat(value, group_sep, dec_sep){
		var fractional_part = "",
			integer_part = "",
			dec_sep_index = -1,
			is_negative = false,
			new_value = "";

		value = removeViewFormat(value, group_sep, dec_sep);
		dec_sep_index = value.indexOf('.');
		is_negative = value.indexOf('-') !== -1;

		if(dec_sep_index !== -1){
			fractional_part = value.slice(dec_sep_index + 1);
		}
		integer_part = value.slice(Number(is_negative), dec_sep_index === -1 ? value.length : dec_sep_index);
		for(var i = integer_part.length - 4; i >= 0; i -= 3){
			integer_part = integer_part.slice(0, i + 1) + group_sep + integer_part.slice(i + 1);
		}

		if(is_negative){
			new_value += "-";
		}
		new_value += integer_part;
		if(dec_sep_index !== -1){
			new_value += dec_sep + fractional_part;
		}
		return new_value;
	}

	function hasNumberValue(item){
		return !(typeof item !== "number" || isNaN(item));

	}

	function validate(data, validators){
		//Returns a floating point number or NaN
		if(!hasNumberValue(data)){
			if(hasNumberValue(validators.default_val)){
				return validators.default_val;
			}
			return NaN;
		}

		if(hasNumberValue(validators.minval) && data < validators.minval){
			return validators.minval;
		}
		if(hasNumberValue(validators.maxval) && data > validators.maxval){
			return validators.maxval;
		}
		if(hasNumberValue(validators.precision)){
			var multiplier = Math.pow(10, validators.precision);
			data = Math.floor(data * multiplier) / multiplier;
		}

		return data;
	}

	function linkFunction(scope, element, attrs, ctrl){
		var LANGUAGE, DEC_SEP, GROUP_SEP, VALIDATORS;
		if(!ctrl){
			return;
		}

		(function init(){
			DEC_SEP = '.';
			GROUP_SEP = '';
			LANGUAGE = attrs['culture'] || "en";
			VALIDATORS = {
				minval: parseFloat(attrs["minval"]),
				maxval: parseFloat(attrs["maxval"]),
				precision: parseFloat(attrs["precision"]) || 3,
				default_val: parseFloat(attrs['default'])
			};

			if(LANGUAGE.toLowerCase() === "en"){
				GROUP_SEP = ',';
			}
			if(VALIDATORS.precision < 0){
				VALIDATORS.precision = 3;
			}
		})();

		function modelChanged(data){
			if(ctrl.$modelValue === undefined){
				return data;
			}
			data = validate(parseFloat(data), VALIDATORS);
			if(isNaN(data)){
				return "";
			}
			data = applyFormat(data, GROUP_SEP, DEC_SEP);
			return data;
		}

		ctrl.$formatters.unshift(modelChanged);

		element.bind('focus', function(event){
			var data = removeViewFormat(element.val(), GROUP_SEP, DEC_SEP);
			element.val(data);
		});

		element.bind('blur', function(event){
			var data = removeViewFormat(element.val(), GROUP_SEP, DEC_SEP);

			data = validate(parseFloat(data), VALIDATORS);
			if(isNaN(data)){
				data = "";
			}

			scope.$apply(function(){
				ctrl.$setViewValue(data);
			});
			data = applyFormat(data, GROUP_SEP, DEC_SEP);
			element.val(data);
		});

	}

	return{
		restrict: "E",
		require: "ngModel",
		replace: true,
		template: "<input type='text'/>",
		link: linkFunction
	}
});