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

function objectToMap(object){
    var map = Object.entries(object)
    for(value of map){
        value[1] = Object.entries(value[1])
    }
    return map
}

var app = angular.module("angApp", []);
app.controller("appController", function($scope){

    $scope.stock = {'ticker':'','price':'', 'percentChange':'', 'divYield':'', 'freeRate':''}
    $scope.submitDetails = {'percentInterval':'', "numberOfIntervals":""}
    $scope.selectedOptions = []
    $scope.mergedOptions = []

    $scope.getPrice = () => {
        $.post("/price",{ticker: $scope.stock.tickerSymbol}, function(data){
            //do things with data returned from app js
            console.log(data)
            if( data == null || data.hasOwnProperty('error') || data.hasOwnProperty('unmatched_symbols' )){
                data = notFound
            }
            $scope.stock.price = data.price
            $scope.stock.percentChange = data.change
            loadIconStop()
            $scope.$apply()
        });
        loadIconStart()  
    }
    
    $scope.getOptionsChain = () => {
        $.post("/chain",{ticker: $scope.stock.tickerSymbol}, function(data){
            //do things with data returned from app js
            console.log(data)
            if(data == null || data == undefined || data.hasOwnProperty('error')){
                data = 'NOT FOUND'
                loadIconStop()
            }
            else{
                $scope.chains = data;
                $scope.$apply()
                loadIconStop()
            }
        });
        loadIconStart()
    }

    $scope.addLeg = () => {
        //open modal
    }

    $scope.removeLeg = () => {
        //remove from options selected
    }

    $scope.editLeg = () => {
        //call remove leg and then add leg
    }

    $scope.expandExpiry = () => {
        //collapse all expiries
    }

    $scope.selectOption = () => {
        //add option to options selected
        //call close modal
    }

    $scope.closeModal = () => {
        //close modal
    }

    $scope.calculateProfits = () => {
        //calculate profits
    }

    $scope.mergeProfits = () => {
        //create merged strategy data
    }

    $scope.f = () => {

    }

})