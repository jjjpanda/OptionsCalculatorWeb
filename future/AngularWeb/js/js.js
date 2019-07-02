const loadingIcon = "#loadingIcon"
var currentBiggestID = 0

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
        $scope.getOptionsChain()
        console.log('CREATE MODAL')
    }

    $scope.expandExpiry = () => {
        //collapse all expiries
    }

    $scope.selectOption = ($event, price, strike, expiry, isCall) => {
        var option = {}
        option.price = parseFloat(price)
        option.boughtAt = parseFloat(price)
        option.strike = parseFloat(strike)
        option.expiry = expiry
        option.quantity = 1
        option.isCall = isCall
        option.isLong = true;
        option.id = currentBiggestID++
        option.iv = 0
        option.ivEdited = 0

        console.log(option)
        $scope.selectedOptions.push(option)
    }

    $scope.closeModal = () => {
        //close modal
    }

    $scope.mergeProfits = () => {
        //create merged strategy data
    }

    $scope.calculateProfits = () => {
        //calculate profits
    }

    $scope.removeLeg = (id) => {
        $scope.selectedOptions.splice($scope.selectedOptions.findIndex(x => x.id == id), 1)
        console.log($scope.selectedOptions)
    }

    $scope.editLeg = (id) => {
        $scope.selectedOptions.splice($scope.selectedOptions.findIndex(x => x.id == id), 1)
        $scope.addLeg()
    }

    $scope.displayProfit = () => {

    }

    

})