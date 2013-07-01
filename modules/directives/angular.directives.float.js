'use strict';
angular.module("angular.directives.float", []).directive("float", function(){
	function removeViewFormat(value, group_sep, dec_sep){
		if(group_sep!==''){
			value = value.toString().replace(new RegExp(group_sep, 'g'), '');}
		if(dec_sep !== '.'){
			value = value.toString().replace(new RegExp(dec_sep, 'g'), '.');
		}
		return value;
	}

	function applyFormat(value, group_sep, dec_sep){
		var	fractional_part = "",
			integer_part = "",
			dec_sep_index = -1,
			is_negative = false,
			new_value = "";

		value = removeViewFormat(value,group_sep,dec_sep);
		dec_sep_index = value.indexOf('.'),
		is_negative = value.indexOf('-')!==-1;

		if(dec_sep_index!==-1){
			fractional_part = value.slice(dec_sep_index+1);
		}
		integer_part = value.slice(Number(is_negative),dec_sep_index===-1?value.length:dec_sep_index);
		for(var i=integer_part.length-4;i>=0;i-=3){
			integer_part = integer_part.slice(0,i+1)+group_sep+integer_part.slice(i+1);
		}

		if(is_negative){
			new_value+="-";
		}
		new_value+=integer_part;
		if(dec_sep_index!==-1){
			new_value+=dec_sep+fractional_part;
		}
		return new_value;
	}

	function validate(data){
		data = data.toString();

		return data;
	}

	function linkFunction(scope, element, attrs, ctrl){
		if(!ctrl){
			return;
		}
		var MIN_VAL, MAX_VAL, LANGUAGE = 'en', DEC_SEP = '.', GROUP_SEP = ',',DEFAULT_VAL="0";

		function viewChanged(data){
			data = validate(data || '');
			return data;
		}

		function modelChanged(data){
			data = validate(data || '');
			return data;
		}

		ctrl.$parsers.unshift(viewChanged);
		ctrl.$formatters.unshift(modelChanged);

		element.bind('focus',function(event){
			var data = element.val();
			data = removeViewFormat(data,GROUP_SEP,DEC_SEP);
			element.val(data);
		});
		element.bind('blur',function(event){
			var data = element.val();
			if(data===""){
				data = DEFAULT_VAL;
			}
			data = applyFormat(data,GROUP_SEP,DEC_SEP);
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