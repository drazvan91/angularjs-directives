'use strict';
angular.module("angular.directives.float", ['angular.directives.utils'])
	.value('invalidClass', "css-invalid")
	.directive("float", ['Utils', "invalidClass", function(Utils, invalidClass){

		function linkFunction(scope, element, attrs, ctrl){
			var culture, VALIDATORS;
			if(!ctrl){
				return;
			}

			(function init(){
				culture = attrs['culture'];

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

				var temp_data = Utils.formats.remove(element.val(), culture)
				var valid = Utils.parsers.validateNumber(parseFloat(temp_data), VALIDATORS);

				if(!isNaN(valid)){
					valid = parseFloat(temp_data) === valid;
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
				data = Utils.parsers.validateNumber(parseFloat(data), VALIDATORS);
				if(isNaN(data)){
					return "";
				}
				data = Utils.formats.apply(data, culture);
				return data;
			}

			ctrl.$parsers.unshift(viewChanged);
			ctrl.$formatters.unshift(modelChanged);

			element.bind('focus', function(){
				var data = Utils.formats.remove(element.val(), culture);
				if(culture){
					data = data.replace('.', Utils.cultures.getCulture(culture).decimal_separator);
				}
				else{
					data = data.replace('.', Utils.cultures.getCurrentCulture().decimal_separator);
				}
				element.val(data);
			});

			element.bind('blur', function(){
				var data = Utils.formats.remove(element.val(), culture);

				data = Utils.parsers.validateNumber(parseFloat(data), VALIDATORS);
				if(isNaN(data)){
					data = "";
				}

				scope.$apply(function(){
					ctrl.$setViewValue(data);
				});
				data = Utils.formats.apply(data, culture);
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