"use strict";

angular.module('angular.directives.utils', []).factory("Utils",function(){
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
			],
			current_culture = culture_list[0];

		/**
		 * Sets the current culture and calls subscribers
		 * @param {string} lang
		 */
		function setCurrentCulture(lang){
			for(var i = 0; i < culture_list.length; i++){
				if(culture_list[i].language === lang){
					current_culture = culture_list[i];
					return;
				}
			}
		}

		/**
		 * Returns a copy of the culture or null
		 * @param {string} lang
		 * @returns {object,null}
		 */
		function getCulture(lang){
			for(var i = 0; i < culture_list.length; i++){
				if(culture_list[i].language === lang){
					return angular.copy(culture_list[i]);
				}
			}
			return null;
		}

		/**
		 * Returns a copy of the current culture
		 * @returns {object}
		 */
		function getCurrentCulture(){
			return angular.copy(current_culture);
		}

		return {
			getCurrentCulture: getCurrentCulture,
			getCulture: getCulture,
			setCurrentCulture: setCurrentCulture
		}
	})();

	var FORMATS = (function(){
		/**
		 * Removes the number formatting from the value
		 * @param {string} value
		 * @param {string} [culture]
		 * @returns {string}
		 */
		function removeFormat(value, culture){
			if(!value){
				return ""
			}
			var cult = CULTURES.getCulture(culture) || CULTURES.getCurrentCulture();
			var val = value.toString();
			if(cult.group_separator !== ''){
				val = val.split(cult.group_separator);
				val = val.join("");
			}
			if(cult.decimal_separator !== '.'){
				val = val.split(cult.decimal_separator);
				val = val.join('.');
			}
			return val;
		}

		/**
		 * Applies a culture-specific number formatting to value
		 * @param {string} value
		 * @param {string} [culture]
		 * @returns {string}
		 */
		function applyFormat(value, culture){
			if(!value){
				return ""
			}
			var fractional_part = "",
				integer_part,
				dec_sep_index,
				is_negative,
				new_value = "";

			var cult = CULTURES.getCulture(culture) || CULTURES.getCurrentCulture();
			var val = value.toString();

			dec_sep_index = val.indexOf('.');
			is_negative = val.indexOf('-') !== -1;

			if(dec_sep_index !== -1){
				fractional_part = val.slice(dec_sep_index + 1);
			}
			integer_part = val.slice(Number(is_negative), dec_sep_index === -1 ? val.length : dec_sep_index);
			for(var i = integer_part.length - 4; i >= 0; i -= 3){
				integer_part = integer_part.slice(0, i + 1) + cult.group_separator + integer_part.slice(i + 1);
			}

			if(is_negative){
				new_value += "-";
			}
			new_value += integer_part;
			if(dec_sep_index !== -1){
				new_value += cult.decimal_separator + fractional_part;
			}
			return new_value;
		}

		return {
			apply: applyFormat,
			remove: removeFormat
		};
	})();

	var PARSERS = (function(){
		/**
		 * Returns true if item is a valid number
		 * @param {number} item
		 * @returns {boolean}
		 */
		function hasNumberValue(item){
			return !(typeof item !== "number" || isNaN(item));
		}

		/**
		 * Returns the validated number or NaN
		 * @param {number} input
		 * @param {object} validators (default_val,minval,maxval,precision)
		 * @returns {number,NaN}
		 */
		function validateNumber(input, validators){
			if(!hasNumberValue(input)){
				if(hasNumberValue(validators.default_val)){
					return validators.default_val;
				}
				return NaN;
			}
			if(hasNumberValue(validators.minval) && input < validators.minval){
				return validators.minval;
			}
			if(hasNumberValue(validators.maxval) && input > validators.maxval){
				return validators.maxval;
			}
			if(hasNumberValue(validators.precision)){
				var x = input.toString().indexOf('.');

				if(x<0 || x+validators.precision+1 >= input.toString().length){
					return input;
				}
				input = parseFloat(input.toString().slice(0,x+validators.precision+1));
			}

			return input;
		}

		return {
			validateNumber: validateNumber
		}
	})();

	return {
		cultures: CULTURES,
		formats: FORMATS,
		parsers: PARSERS
	};
}).filter("float", ['Utils', function(Utils){
		return function(input, options){
			options = options || {};
			input = Utils.parsers.validateNumber(parseFloat(input), {precision: options.precision || 2}) || "";
			input = Utils.formats.apply(input.toString(), options.culture);
			return input;
		}
	}]).run(['Utils', function(Utils){
		window.hacks = Utils;
	}]);;