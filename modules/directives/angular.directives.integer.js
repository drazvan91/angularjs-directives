'use strict';
angular.module("angular.directives.integer", ['angular.directives.utils'])
	.value('invalidClass', "css-invalid")
	.directive("integer", ['Utils', 'invalidClass', function(Utils, invalidClass){
		function removeViewFormat(value, culture){
			if(culture.group_separator !== ''){
				value = value.toString().split(culture.group_separator);
				value = value.join("");
			}
			return value;
		}

		function applyFormat(value, culture){
			var integer_part,
				is_negative,
				new_value = "";

			value = value.toString();
			is_negative = value.indexOf('-') !== -1;

			integer_part = value.slice(Number(is_negative), value.length);
			for(var i = integer_part.length - 4; i >= 0; i -= 3){
				integer_part = integer_part.slice(0, i + 1) + culture.group_separator + integer_part.slice(i + 1);
			}

			if(is_negative){
				new_value += "-";
			}
			new_value += integer_part;
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

			return data;
		}

		function linkFunction(scope, element, attrs, ctrl){
			var getCulture, VALIDATORS;
			if(!ctrl){
				return;
			}

			(function init(){
				getCulture = Utils.cultures.getCurrentCulture;
				if(attrs['culture']){
					getCulture = function(){
						return Utils.cultures.getCulture(attrs['culture']);
					}
				}
				VALIDATORS = {
					minval: parseInt(attrs["minval"], 10),
					maxval: parseInt(attrs["maxval"], 10),
					default_val: parseInt(attrs['default'], 10)
				};
			})();

			function viewChanged(data){
				var temp_data = removeViewFormat(element.val(), getCulture()),
					valid = validate(parseInt(temp_data, 10), VALIDATORS);

				if(!isNaN(valid)){
					valid = parseInt(temp_data, 10) === valid;
				}
				else{
					valid = true;
				}
				if(!valid){
					element.addClass(invalidClass);
				}
				else{
					element.removeClass(invalidClass);
				}

				return data;
			}

			function modelChanged(data){
				if(ctrl.$modelValue === undefined){
					return data;
				}
				data = validate(parseInt(data, 10), VALIDATORS);
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
				element.val(data);
			});

			element.bind('blur', function(){
				var data = removeViewFormat(element.val(), getCulture());

				data = validate(parseInt(data, 10), VALIDATORS);
				if(isNaN(data)){
					data = "";
				}

				scope.$apply(function(){
					ctrl.$setViewValue(data);
				});
				data = applyFormat(data, getCulture());
				element.val(data);
				element.removeClass(invalidClass);
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