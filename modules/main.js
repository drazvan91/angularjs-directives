var mainapp = angular.module("myapp", []);

var MainCtrl = function ($scope) {
    $scope.ceva = 15;
    $scope.abcde = function () {
        console.log($scope.ceva);
    }
};