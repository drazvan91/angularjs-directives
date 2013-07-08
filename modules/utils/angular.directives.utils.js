"use strict";

angular.module('angular.directives.utils', []).factory("Utils", function(){
	var CULTURES = (function(){
		var culture_list = [
			{
				language: "",
				group_separator: "",
				decimal_separator: "."
			},
			{
				language: "en",
				group_separator: ",",
				decimal_separator: '.'
			},
			{
				language: "nl",
				group_separator: ".",
				decimal_separator: ","
			}
		];
		var current_culture = culture_list[0];

		function setCurrentCulture(lang){
			for(var i = 0; i < culture_list.length; i++){
				if(culture_list[i].language === lang){
					current_culture = culture_list[i];
					return;
				}
			}
		}

		function getCulture(lang){
			for(var i = 0; i < culture_list.length; i++){
				if(culture_list[i].language === lang){
					return angular.copy(culture_list[i]);
				}
			}
			return null;
		}

		function getCurrentCulture(){
			return angular.copy(current_culture);
		}

		return {
			getCurrentCulture: getCurrentCulture,
			getCulture: getCulture,
			setCurrentCulture: setCurrentCulture
		}
	})();

	return {
		cultures: CULTURES
	};
});