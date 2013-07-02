'use strict';
angular.module("angular.directives.integer", ['angular.directives.utils'])
	.directive("integer", ['Utils', function(Utils){
		function removeViewFormat(value, group_sep){
			if(group_sep !== ''){
				value = value.toString().split(group_sep);
				value = value.join("");
			}
			return value;
		}

		function applyFormat(value, group_sep){
			var integer_part,
				is_negative,
				new_value = "";

			value = value.toString();
			is_negative = value.indexOf('-') !== -1;

			integer_part = value.slice(Number(is_negative),
									   value.length);
			for(var i = integer_part.length - 4;
				i >= 0; i -= 3){
				integer_part = integer_part.slice(0,
												  i + 1) + group_sep + integer_part.slice(i + 1);
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
			var GROUP_SEP, VALIDATORS;
			if(!ctrl){
				return;
			}

			(function init(){
				var language = attrs['culture'],
					culture = null;
				if(language){
					culture = Utils.cultures.getCulture(language);
				}
				if(culture === null){
					culture = Utils.cultures.getCurrentCulture();
				}
				GROUP_SEP = culture.group_separator;

				VALIDATORS = {
					minval: parseInt(attrs["minval"],
									 10),
					maxval: parseInt(attrs["maxval"],
									 10),
					default_val: parseInt(attrs['default'],
										  10)
				};
			})();

			function modelChanged(data){
				if(ctrl.$modelValue === undefined){
					return data;
				}
				data = validate(parseInt(data,
										 10),
								VALIDATORS);
				if(isNaN(data)){
					return "";
				}
				data = applyFormat(data,
								   GROUP_SEP);
				return data;
			}

			ctrl.$formatters.unshift(modelChanged);

			element.bind('focus',
						 function(){
							 var data = removeViewFormat(element.val(),
														 GROUP_SEP);
							 element.val(data);
						 });

			element.bind('blur',
						 function(){
							 var data = removeViewFormat(element.val(),
														 GROUP_SEP);

							 data = validate(parseInt(data,
													  10),
											 VALIDATORS);
							 if(isNaN(data)){
								 data = "";
							 }

							 scope.$apply(function(){
								 ctrl.$setViewValue(data);
							 });
							 data = applyFormat(data,
												GROUP_SEP);
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
	}]);