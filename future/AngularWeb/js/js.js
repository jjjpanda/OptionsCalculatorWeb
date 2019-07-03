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

    $scope.stock = {'ticker':'','price':'', 'percentChange':'', 'divYield':0, 'freeRate':0}
    $scope.submitDetails = {'percentInterval':1, "numberOfIntervals":10}
    $scope.display = {"optionsSelection":false, "expandedExpiries":{}, "profitTable":false}
    $scope.selectedOptions = []
    $scope.mergedOptions = []
    $scope.rangeOfPrices = []

    $scope.getPrice = (showLoadingIcon) => {
        $.post("/price",{ticker: $scope.stock.tickerSymbol}, function(data){
            //do things with data returned from app js
            console.log(data)
            if( data == null || data.hasOwnProperty('error') || data.hasOwnProperty('unmatched_symbols' )){
                data = notFound
            }
            $scope.stock.price = data.price
            $scope.stock.percentChange = data.change
            if(showLoadingIcon) {
                loadIconStop()
                $scope.fillRangeOfPrices()
            }
            $scope.$apply()
        });
        if(showLoadingIcon) {loadIconStart()}  
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
        $scope.getPrice(false)
        $scope.getOptionsChain(() => {
            $scope.display.optionsSelection = true;
        })
    }

    $scope.collapseAllExpiries = () => {
        $scope.chains.forEach(x => {
            $scope.display.expandedExpiries[x[0]] = false;
        })
    }

    $scope.expandExpiry = (index) => {
        if($scope.display.expandedExpiries[index] == true){
            $scope.display.expandedExpiries[index] = false
        }
        else{
            $scope.collapseAllExpiries()
            $scope.display.expandedExpiries[index] = true
        }
    }

    $scope.selectOption = ($event, price, strike, expiry, isCall) => {
        var option = {}
        option.price = parseFloat(price)
        option.boughtAt = parseFloat(price)
        option.strike = parseFloat(strike)
        option.expiry = expiry
        option.timeTillExpiry = timeTillExpiry(expiryConvertToDate(option.expiry))
        option.quantity = 1
        option.isCall = isCall
        option.isLong = true;
        option.id = currentBiggestID++
        option.iv = calculateIV(option.timeTillExpiry, option.price, $scope.stock.price, option.strike, option.isCall, $scope.stock.freeRate, $scope.stock.divYield)
        option.ivEdited = option.iv

        console.log(option)
        $scope.selectedOptions.push(option)
        $scope.closeModal()
    }

    $scope.closeModal = () => {
        //close display
        $scope.display.optionsSelection = false;

    }

    $scope.removeLeg = (id) => {
        $scope.selectedOptions.splice($scope.selectedOptions.findIndex(x => x.id == id), 1)
        console.log($scope.selectedOptions)
    }

    $scope.editLeg = (id) => {
        $scope.selectedOptions.splice($scope.selectedOptions.findIndex(x => x.id == id), 1)
        $scope.addLeg()
    }

    $scope.fillRangeOfPrices = () => {
        $scope.rangeOfPrices = []
        min = $scope.stock.price/Math.pow(1+($scope.submitDetails.percentInterval/100), Math.floor($scope.submitDetails.numberOfIntervals/2))
        max = $scope.stock.price*Math.pow(1+($scope.submitDetails.percentInterval/100), Math.floor($scope.submitDetails.numberOfIntervals/2))
        for(i = min; i < max * (1+($scope.submitDetails.percentInterval/200)); i *= (1+($scope.submitDetails.percentInterval/100))){
            $scope.rangeOfPrices.push([i, 0])
        }
        console.log($scope.rangeOfPrices)
    }

    $scope.mergeProfits = () => {
        //create merged strategy data
    }

    $scope.calculateProfits = (callback) => {
        for(option of $scope.selectedOptions){
            option.greeks = calculateGreeks(option.timeTillExpiry, $scope.stock.price, option.strike, option.isCall, option.isLong, $scope.stock.freeRate, $scope.stock.divYield, option.iv)
            option.profit = []
            d = getCurrentDate()
            while(timeBetweenDates(expiryConvertToDate(option.expiry), d) > -1){
                option.profit.push([dateToString(d),[...$scope.rangeOfPrices]]) //its not creating a deep copy pls fix
                for(price of option.profit[option.profit.length-1][1]){
                    price[1] = calculateOptionsPrice(percentageOfYear(timeBetweenDates(expiryConvertToDate(option.expiry), d)), price[0], option.strike, option.isCall, option.isLong, $scope.stock.freeRate, $scope.stock.divYield, option.ivEdited) - option.boughtAt
                }
                d = incrementOneDay(d)
            }
        }
        console.log($scope.selectedOptions)
        callback()
    }

    $scope.displayProfit = () => {
        $scope.calculateProfits(() => {
            $scope.display.profitTable = true;
        })
    }

    $scope.init = () => {
        //Things to do on init
    }

    $scope.init()

})