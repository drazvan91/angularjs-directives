'use strict';
angular.module("angular.directives.float", ['angular.directives.utils'])
	.directive("float", ['Utils', function(Utils){

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

			function viewChanged(){

				var temp_data = Utils.formats.remove(element.val(), culture)
				var validated = Utils.parsers.validateNumber(parseFloat(temp_data), VALIDATORS);
				var invalid = true;
				if(!isNaN(validated)){
					invalid = parseFloat(temp_data) !== validated;
					if(invalid === false){
						invalid = temp_data!==validated.toString();
					}
				}

				if(invalid){
					element.addClass(Utils.ui.invalidCSS);
				}
				else{
					element.removeClass(Utils.ui.invalidCSS);
				}

				return validated;
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
				data = Utils.formats.apply(data.toString(), culture);
				element.val(data);
				element.removeClass(Utils.ui.invalidCSS);
			});

			ctrl.$parsers.unshift(viewChanged);
			ctrl.$formatters.unshift(modelChanged);
		}

		return{
			restrict: "E",
			require: "ngModel",
			replace: true,
			template: "<input type='text'/>",
			link: linkFunction
		}
	}]);