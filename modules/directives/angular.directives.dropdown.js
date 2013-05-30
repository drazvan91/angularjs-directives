/*
Copyright 2013 Dragomir Razvan

This software is licensed under the Apache License, Version 2.0 (the "Apache License") or the GNU
General Public License version 2 (the "GPL License"). You may choose either license to govern your
use of this software only upon the condition that you accept all of the terms of either the Apache
License or the GPL License.
*/

/*
           object - required
           ajaxUrl - required
   
           langFunc - optional. Default: EN
           maxSelectionSize - optional. Default: -1
           valueField - optional. Default 'Value'
           textField - optional. Default 'Text'
           
       */
angular.module("angular.directives.dropdown", [])
    .directive("dropdown", function () {
        function setDefaultAttrs(attrs) {
            if (!attrs.textField) {
                attrs.textField = "Text";
            }
            if (!attrs.allowCreate) {
                attrs.allowCreate = false;
            }
            if (attrs['disabledModel']) {
                scope.$watch("disabledModel", function (value) {
                    if (value) {
                        element.select2("disable");
                    }
                    else {
                        element.select2("enable");
                    }
                });
            }
        }
        var linkFunction = function (scope, element, attrs, ctrl) {
            setDefaultAttrs(attrs);
            scope.$watch("ngModel",function(value){
                element.select2("val", value); // it doesnt matter what value we assign here, because we will override it in initSelection
            });

            element.select2({
                placeholder: "",
                /*                minimumInputLength: 1,*/
                multiple: true,
                minimumResultsForSearch: attrs.allowCreate ? 0 : 99,
                /*maximumSelectionSize: attrs.maxSelectionSize,*/
                allowClear: false,
                data: {
                    results: scope.dataSource,
                    text: function (item) {
                        return item[attrs.textField];
                    }
                },
                /*query: function(query){
                    query.callback(scope.dataSource);
                },*/
                initSelection: function (element, callback) {
                    var obj = undefined;
                    if (attrs["valueField"]) {
                        obj = $(scope.dataSource).filter(function () {
                            return this[attrs['valueField']] == scope.ngModel;
                        })[0];
                    }
                    else {
                        obj = scope.ngModel;
                    }
                    callback(obj);
                },
                createSearchChoice: function (term, data) {
                    if (attrs.allowCreate) {
                        if ($(data).filter(function () {
                            return this[attrs['textField']].localeCompare(term) === 0;
                        }).length === 0) {
                            var newObject = {};
                            newObject[attrs["textField"]] = term;
                            return newObject;
                        }
                    }
                    return null;
                },
                id: function (e) {
                    if (!e) { return undefined; }
                    if (e[attrs["textField"]]) {
                        return e[attrs["textField"]];
                    }
                    return e;
                },
                formatSelection: function (data) {
                    if (data[attrs["textField"]] === undefined)
                        return data;

                    return data[attrs["textField"]];
                },
                formatResult: function (result) {
                    if (result[attrs["textField"]] === undefined)
                        return '<div>' + result + '</div>';

                    return '<div>' + result[attrs["textField"]] + '</div>';
                }
            });
            element.change(function (value) {
                var elem = element;
                if (value.val) {
                    scope.$apply(function () {
                        if (attrs["valueField"]) {
                            scope.ngModel = elem.select2("data")[attrs["valueField"]];
                        }
                        else {
                            scope.ngModel = elem.select2("data");
                        }
                    });
                }
            });
        }

        return {
            restrict: "E",
            replace: true,
            template: "<input type='text' />",
            scope:
                {
                    ngModel: "=",
                    dataSource: "=items",
                    disabledModel: "="
                },
            link: linkFunction
        };
    });