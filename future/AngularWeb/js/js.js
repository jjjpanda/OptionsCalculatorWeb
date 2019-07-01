const loadingIcon = "#loadingIcon"

function loadIconStart(){
    $(loadingIcon).css('visibility', 'visible')
}

function loadIconStop(){
    $(loadingIcon).fadeOut(200, function(){
        $(loadingIcon).css('display','inline')
        $(loadingIcon).css('visibility','hidden')
    })
}

var app = angular.module("angApp", []);
app.controller("appController", function($scope){

    $scope.stock = {'ticker':'','price':'', 'percentChange':'', 'divYield':'', 'freeRate':''}
    $scope.submitDetails = {'percentInterval':'', "numberOfIntervals":""}
    $scope.selectedOptions = []
    $scope.mergedOptions = []

    $scope.getPrice = () => {

    }
    
    $scope.getOptionsChain = () => {

    }

    $scope.calculateProfits = () => {

    }

    $scope.removeLeg = () => {

    }

    $scope.editLeg = () => {

    }

    $scope.closeModal = () => {

    }

    $scope.openExpiry = () => {

    }

    $scope.selectOptions = () => {

    }

    $scope. = () => {

    }

    $scope.f = () => {

    }

    $scope.f = () => {

    }

    $scope.f = () => {

    }

    $scope.f = () => {

    }

    $scope.f = () => {

    }

})