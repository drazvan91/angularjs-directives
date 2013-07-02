"use strict";

angular.module('angular.directives.utils', []).factory("Utils", function(){
	var CULTURES = (function(){
		var culture_list = [
			{
				language: "en",
				group_separator: ",",
				decimal_separator: '.'
			},
			{
				language: "nl",
				group_separator: ".",
				decimal_separator: ","
			},
			{
				language: "",
				group_separator: "",
				decimal_separator: "."
			}
		];
		var current_culture = null;
		setCurrentCulture("");

		function setCurrentCulture(cultureLang){
			for(var i = 0; i < culture_list.length; i++){
				if(culture_list[i].language === cultureLang){
					current_culture = culture_list[i];
					return;
				}
			}
		}

		function getCulture(cultureLang){
			for(var i = 0; i < culture_list.length; i++){
				if(culture_list[i].language === cultureLang){
					return angular.copy(culture_list[i]);
				}
			}
			return null;
		}

		function getCurrentCulture(){
			return angular.copy(current_culture);
		}

		return {
			getCurrentCulture: function(){
				return getCurrentCulture();
			},
			getCulture: function(cultureLang){
				return getCulture(cultureLang);
			},
			setCurrentCulture: function(cultureLang){
				setCurrentCulture(cultureLang);
			}
		}
	})();

	return {
		cultures: CULTURES
	};
});