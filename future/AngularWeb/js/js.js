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
    $scope.modal = {"optionsSelection":false, "expandedExpiries":{}}
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
    
    $scope.getOptionsChain = (callback) => {
        $.post("/chain",{ticker: $scope.stock.tickerSymbol}, function(data){
            //do things with data returned from app js
            console.log(data)
            if(data == null || data == undefined || data.hasOwnProperty('error')){
                data = 'NOT FOUND'
                loadIconStop()
            }
            else{
                $scope.chains = data;
                $scope.collapseAllExpiries()
                callback()
                loadIconStop()
                $scope.$apply()
            }
        });
        loadIconStart()
    }

    $scope.addLeg = () => {
        $scope.getOptionsChain(() => {
            $scope.modal.optionsSelection = true;
        })
    }

    $scope.collapseAllExpiries = () => {
        $scope.chains.forEach(x => {
            $scope.modal.expandedExpiries[x[0]] = false;
        })
    }

    $scope.expandExpiry = (index) => {
        if($scope.modal.expandedExpiries[index] == true){
            $scope.modal.expandedExpiries[index] = false
        }
        else{
            $scope.collapseAllExpiries()
            $scope.modal.expandedExpiries[index] = true
        }
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
        option.iv = calculateIV(timeTillExpiry(expiryConvertToDate(option.expiry)), option.price, $scope.stock.price, option.strike, option.isCall, 0, 0)
        option.ivEdited = option.iv

        console.log(option)
        $scope.selectedOptions.push(option)
        $scope.closeModal()
    }

    $scope.closeModal = () => {
        //close modal
        $scope.modal.optionsSelection = false;

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