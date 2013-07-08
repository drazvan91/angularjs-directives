'use strict';
angular.module("angular.directives.float", ['angular.directives.utils'])
	.value('invalidClass',"css-invalid")
	.directive("float", ['Utils',"invalidClass", function(Utils,invalidClass){
		function removeViewFormat(value, culture){
			if(culture.group_separator !== ''){
				value = value.toString().split(culture.group_separator);
				value = value.join("");
			}
			if(culture.decimal_separator !== '.'){
				value = value.split(culture.decimal_separator);
				value = value.join('.');
			}
			return value;
		}

		function applyFormat(value, culture){
			var fractional_part = "",
				integer_part,
				dec_sep_index,
				is_negative,
				new_value = "";

			value = value.toString();
			dec_sep_index = value.indexOf('.');
			is_negative = value.indexOf('-') !== -1;

			if(dec_sep_index !== -1){
				fractional_part = value.slice(dec_sep_index + 1);
			}
			integer_part = value.slice(Number(is_negative), dec_sep_index === -1 ? value.length : dec_sep_index);
			for(var i = integer_part.length - 4; i >= 0; i -= 3){
				integer_part = integer_part.slice(0, i + 1) + culture.group_separator + integer_part.slice(i + 1);
			}

			if(is_negative){
				new_value += "-";
			}
			new_value += integer_part;
			if(dec_sep_index !== -1){
				new_value += culture.decimal_separator + fractional_part;
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
			var getCulture,VALIDATORS;
			if(!ctrl){
				return;
			}

			(function init(){
				getCulture = Utils.cultures.getCurrentCulture;
				if (attrs['culture']){
					getCulture = function(){
						return Utils.cultures.getCulture(attrs['culture']);
					}
				}

				VALIDATORS = {
					minval: parseFloat(attrs["minval"]),
					maxval: parseFloat(attrs["maxval"]),
					precision: parseFloat(attrs["precision"]) || 3,
					default_val: parseFloat(attrs['default'])
				};

				if(VALIDATORS.precision < 0){
					VALIDATORS.precision = 3;
				}
			})();

			function viewChanged(data){
				var temp_data = removeViewFormat(element.val(), getCulture()),
					valid = validate(parseFloat(temp_data),VALIDATORS);

				if(!isNaN(valid)){
					valid = parseFloat(temp_data)===valid;
				}
				else{
					valid = true;
				}
				if(!valid){
					element[0].classList.add(invalidClass);
				}
				else{
					element[0].classList.remove(invalidClass);
				}

				return data;
			}

			function modelChanged(data){
				if(ctrl.$modelValue === undefined){
					return data;
				}
				data = validate(parseFloat(data), VALIDATORS);
				if(isNaN(data)){
					return "";
				}
				data = applyFormat(data, getCulture());
				return data;
			}

			ctrl.$parsers.unshift(viewChanged);
			ctrl.$formatters.unshift(modelChanged);

			element.bind('focus', function(){
				var data = removeViewFormat(element.val(), getCulture());
				data = data.replace('.', getCulture().decimal_separator);
				element.val(data);
			});

			element.bind('blur', function(){
				var data = removeViewFormat(element.val(), getCulture());

				data = validate(parseFloat(data), VALIDATORS);
				if(isNaN(data)){
					data = "";
				}

				scope.$apply(function(){
					ctrl.$setViewValue(data);
				});
				data = applyFormat(data, getCulture());
				element.val(data);
				element[0].classList.remove(invalidClass);
			});

		}

		return{
			restrict: "E",
			require: "ngModel",
			replace: true,
			template: "<input type='text'/>",
			link: linkFunction
		}
	}]);