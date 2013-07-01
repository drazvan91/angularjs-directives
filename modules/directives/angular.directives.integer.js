'use strict';
angular.module("angular.directives.integer", []).directive("integer", function(){
	var getKeyValue = function(keyCode){
		if(keyCode === 189 || keyCode === 109 || keyCode === 173){
			return '-';
		}
		if(keyCode === 32){
			return ' ';
		}
		if((keyCode >= 96 && keyCode <= 105) || (keyCode >= 48 && keyCode <= 57)){
			return String(keyCode % 48);
		}
		return undefined;
	};
	var keyValidator = function(event){
		var caretStart = event.target.selectionStart,
			caretEnd = event.target.selectionEnd,
			key = event.keyCode,
			lastValue = event.target.value;

		if(event.ctrlKey || event.altKey){
			return true;
		}
		if(getKeyValue(key) === ' '){ //Don't allow any spaces
			return false;
		}
		if(!event.shiftKey){
			if(getKeyValue(key) === "-"){
				return !(caretStart !== 0 || (caretEnd === 0 && lastValue.indexOf("-") !== -1));
			}

			if(getKeyValue(key) >= "0" && getKeyValue(key) <= "9"){
				if(lastValue.charAt(0) === "-" && caretStart === 0 && caretEnd === 0){
					return false;
				}
				if((lastValue.charAt(0) === "0" && caretStart !== 0) || (lastValue === "-0" && caretStart !== 1)){
					return false;
				}
				if(getKeyValue(key) === "0"){
					if((lastValue.charAt(0) === "-" && caretStart === 1 &&
						caretEnd !== lastValue.length && lastValue.length !== 1)
						|| (caretStart === 0 && caretEnd !== lastValue.length && lastValue.length !== 0)){
						return false;
					}
				}
				return true;
			}
		}
		return key <= 46;


	};

	var linkFunction = function(scope, element, attrs, ctrl){

		var minval = parseInt(attrs.minval),
			maxval = parseInt(attrs.maxval);
		if(!isNaN(minval) && !isNaN(maxval) && minval > maxval){
			console.warn("On directive number the minval is greater than maxval");
		}
		var setElementValue = function(value){
			scope.$apply(function(){
				element.val(value);
				ctrl.$setViewValue(value);
			})
		};


		//Event Handlers
		var inputHandler = function(event){
			if(!isNaN(minval) && minval > 0 && getKeyValue(event.keyCode) === '-'){
				event.preventDefault();
			}
			if(!keyValidator(event)){
				event.preventDefault();
			}
		};
		var rangeHandler = function(event){
			var value = Number(event.target.value);

			if(!isNaN(value)){
				if(!isNaN(minval) && value < 0 && value < minval){
					setElementValue(minval);
				}
				if(!isNaN(maxval) && value > 0 && value > maxval){
					setElementValue(maxval);
				}
			}
		};
		var blurHandler = function(event){
			var value = Number(event.target.value);
			if(event.target.value === ""){
				value = NaN;
			}
			if(isNaN(value)){
				setElementValue("");
				return;
			}
			if(!isNaN(minval) && value < minval){
				setElementValue(minval);
				return;
			}
			if(!isNaN(maxval) && value > maxval){
				setElementValue(maxval);
				return;
			}

			setElementValue(value);
		};

		//Event bindings
		element.bind("keydown", inputHandler);
		element.bind("keyup", rangeHandler);
		element.bind("blur", blurHandler);
		element.bind("paste drop", function(e){
			console.log(e, "ToBeImplemented");
		})
	};

	return{
		restrict: "E",
		require: "ngModel",
		replace: true,
		template: "<input type='text' />",
		link: linkFunction
	}
});