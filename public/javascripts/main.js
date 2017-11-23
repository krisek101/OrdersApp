var app = angular.module('myApp', ['ngAnimate']);
app.controller('AddOrderController', function ($scope, $http) {
    $scope.colors = ["Czerwony", "Zielony", "Niebieski"];
    var colorsValue = ["red", "green", "blue"];
    $scope.elements = [];
    $scope.orders = [];
    $scope.defaultColor = "Czerwony";
    $scope.validationForm = {
        'name': true,
        'age': true
    };
    $scope.oneAtATime = true;

    $scope.status = {
        isCustomHeaderOpen: false,
        isFirstOpen: true,
        isFirstDisabled: false
    };

    $scope.activeElements = null;

    $scope.rectangle = {
        "width": "25px",
        "height": "25px",
        "color": "white"
    };

    $scope.sendStatus = {
        "ok": false,
        "noProductsInDb": false
    };

    $scope.updateRect = function () {
        $scope.rectangle.color = colorsValue[$scope.colors.indexOf($scope.order.color)];
        var sizes = {
            "S": "25px",
            "M": "50px",
            "L": "75px",
            "XL": "100px"
        };
        $scope.rectangle.width = sizes[$scope.order.size];
        $scope.rectangle.height = sizes[$scope.order.size];
    };

    $scope.addOrder = function (order) {
        if (order !== null) {
            if (order.name != null && order.age != null && order.color != null && order.size != null && $scope.validationForm.name == true && $scope.validationForm.age == true) {
                $scope.elements.push(order);
                $scope.order = null;
                $scope.rectangle.color = "white";
                $scope.sendCondition = false;
            }
        }
    };

    $scope.checkName = function () {
        var tempString = $scope.order.name;
        if (tempString != null) {
            $scope.order.name = tempString.charAt(0).toUpperCase() + tempString.slice(1);
            $scope.validationForm.name = tempString.split(" ").length <= 1;
        }
    };

    $scope.checkAge = function () {
        $scope.validationForm.age = $scope.order.age >= 18 && $scope.order.age <= 100;
    };

    $scope.sendOrder = function () {
        $http({
            method: 'POST',
            url: '/orders/add',
            data: JSON.stringify($scope.elements)
        }).then(function successCallback(response) {
            window.console.log(response.data);
            $scope.sendStatus.noProductsInDb = false;
            $scope.sendStatus.ok = false;
            switch (response.data) {
                case "noProductsInDb":
                    $scope.sendStatus.noProductsInDb = true;
                    break;
                case "ok":
                    $scope.sendStatus.ok = true;
                    $scope.elements = [];
                    break;
            }
        }, function errorCallback(response) {
            console.log(response.data);
        });
    };

    $scope.removeOrder = function (order) {
        var i = $scope.elements.indexOf(order);
        $scope.elements.splice(i, 1);
    };

    // $scope.getOrders = function () {
    //     $http({
    //         method: 'GET',
    //         url: '/orders/get/all'
    //     }).then(function successCallback(response) {
    //         window.console.log(response.data);
    //
    //     }, function errorCallback(response) {
    //         console.log(response.data);
    //     });
    // }

    $scope.showOrderElements = function (orderID) {
        if (orderID === $scope.activeOrderID) {
            $scope.activeElements = [];
            $scope.activeOrderID = -1;
        } else {
            $http({
                method: 'GET',
                url: '/orders/elements/' + orderID
            }).then(function successCallback(response) {
                if ($scope.activeElements !== response.data.elements) {
                    $scope.activeOrderID = orderID;
                    $scope.activeElements = response.data.elements;
                }
            }, function errorCallback(response) {
                console.log(response.data);
            });
        }
    }

});