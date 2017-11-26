var app = angular.module('myApp', ['ngAnimate']);
app.controller('AddOrderController', function ($scope, $http, $timeout) {
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

    $scope.sendStatus = {
        "ok": false,
        "noProductsInDb": false
    };

    $scope.initMethods = function () {
        $scope.rectangle = {
            "width": "25px",
            "height": "25px",
            "color": "red"
        };
    };

    $scope.updateRect = function () {
        $scope.rectangle.color = colorsValue[$scope.colors.indexOf($scope.orderElement.color)];
        var sizes = {
            "S": "25px",
            "M": "50px",
            "L": "75px",
            "XL": "100px"
        };
        $scope.rectangle.width = sizes[$scope.orderElement.size];
        $scope.rectangle.height = sizes[$scope.orderElement.size];
        if ($scope.orderElement.color != null && $scope.orderElement.size != null) {
            $http({
                method: 'GET',
                url: '/db/store/search/' + $scope.orderElement.color + '/' + $scope.orderElement.size
            }).then(function successCallback(response) {
                $scope.orderElement.quantity = response.data.quantity;
                $scope.orderElement.id = response.data.id;
            }, function errorCallback(response) {
                console.log(response.data);
            });
        }
    };

    $scope.capitalizeName = function () {
        $scope.orderElement.name = $scope.orderElement.name.charAt(0).toUpperCase() + $scope.orderElement.name.slice(1);
        $scope.orderElement.name = $scope.orderElement.name.replace(/ /g, '');
    };

    $scope.addOrderElement = function (orderElement) {
        if (orderElement !== null) {
            $http({
                method: 'GET',
                url: '/db/store/decrease/' + orderElement.id
            });
            $scope.elements.push(orderElement);
            $scope.rectangle.color = "white";
            $scope.sendCondition = false;
        }
    };

    $scope.resetForm = function (form) {
        form.$setPristine();
        $scope.orderElement = {};
    };

    $scope.addOrder = function () {
        $http({
            method: 'POST',
            url: '/db/orders/add',
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
                    $timeout(function () {
                        $scope.sendStatus.ok = false;
                    }, 2000);
                    $scope.elements = [];
                    break;
            }
        }, function errorCallback(response) {
            console.log(response.data);
        });
    };

    $scope.removeOrderElement = function (orderElement) {
        $http({
            method: 'GET',
            url: '/db/store/increase/' + orderElement.id
        });
        var i = $scope.elements.indexOf(orderElement);
        $scope.elements.splice(i, 1);
    };

    $scope.getOrders = function () {
        $http({
            method: 'GET',
            url: '/db/orders/list'
        }).then(function successCallback(response) {
            $scope.orders = response.data.orders;
        }, function errorCallback(response) {
            console.log(response.data);
        });
    };

    $scope.showOrderElements = function (orderID) {
        if (orderID === $scope.activeOrderID) {
            $scope.activeElements = [];
            $scope.activeOrderID = -1;
        } else {
            $http({
                method: 'GET',
                url: '/db/elements/' + orderID
            }).then(function successCallback(response) {
                if ($scope.activeElements !== response.data.elements) {
                    $scope.activeOrderID = orderID;
                    $scope.activeElements = response.data.elements;
                }
            }, function errorCallback(response) {
                console.log(response.data);
            });
        }
    };
});