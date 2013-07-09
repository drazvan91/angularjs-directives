'use strict';
angular.module("angular.directives.integer", ['angular.directives.utils'])
	.value('invalidClass', "css-invalid")
	.directive("integer", ['Utils', 'invalidClass', function(Utils, invalidClass){

		function linkFunction(scope, element, attrs, ctrl){
			var culture, VALIDATORS;
			if(!ctrl){
				return;
			}

			(function init(){
				culture = attrs['culture'];

				VALIDATORS = {
					minval: parseInt(attrs["minval"], 10),
					maxval: parseInt(attrs["maxval"], 10),
					default_val: parseInt(attrs['default'], 10)
				};
			})();

			function viewChanged(data){
				var temp_data = Utils.formats.remove(element.val(), culture),
					valid = Utils.parsers.validateNumber(parseInt(temp_data, 10), VALIDATORS);

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
				data = Utils.parsers.validateNumber(parseInt(data, 10), VALIDATORS);
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
				element.val(data);
			});

			element.bind('blur', function(){
				var data = Utils.formats.remove(element.val(), culture);

				data = Utils.parsers.validateNumber(parseInt(data, 10), VALIDATORS);
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