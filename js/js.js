const loadingIcon = "#loadingIcon"
var currentBiggestID = 0

function mapToObject(map) {
    let obj = Object.create(null);
    for ([k,v] of map) {
        obj[k] = v;
    }
    return obj;
}

function objectToMap(object){
    var map = Object.entries(object)
    for(value of map){
        value[1] = Object.entries(value[1])
    }
    return map
}

var app = angular.module("angApp", ['n3-line-chart']);
app.controller("appController", function($scope){

    $scope.stock = {'ticker':'','price':'', 'percentChange':'', 'divYield':0, 'freeRate':0, "tickerChanged": false}
    $scope.submitDetails = {'percentInterval':1, "numberOfIntervals":10}
    $scope.display = {"loadingIcon":false, "optionsSelection":false, "expandedExpiries":{}, "profitTable":false}
    $scope.selectedOptions = []
    $scope.mergedOptions = {}
    $scope.rangeOfPrices = []

    $scope.loadIconStart = () => {
        $scope.display.loadingIcon = true;
    }

    $scope.loadIconStop = () => {
        $scope.display.loadingIcon = false;
    }

    $scope.getPrice = (showLoadingIcon) => {
        if($scope.stock.tickerChanged || isNaN(minutesSinceLastPriceLoad()) || minutesSinceLastPriceLoad() > 5){
            $.post("/price",{ticker: $scope.stock.tickerSymbol}, function(data){
                //do things with data returned from app js
                console.log(data)
                if( data == null || data.hasOwnProperty('error') || data.hasOwnProperty('unmatched_symbols' )){
                    data = notFound
                }
                $scope.stock.price = data.price
                $scope.stock.percentChange = data.change
                $scope.fillRangeOfPrices()
                if(showLoadingIcon) {$scope.loadIconStop()}
                lastPriceLoad = new Date()
                $scope.$apply()
            });
            if(showLoadingIcon) {$scope.loadIconStart()} 
            $scope.stock.tickerChanged = false;
        } 
    }
    
    $scope.getOptionsChain = (callback) => {
        $.post("/chain",{ticker: $scope.stock.tickerSymbol}, function(data){
            //do things with data returned from app js
            console.log(data)
            if(data == null || data == undefined || data.hasOwnProperty('error')){
                data = 'NOT FOUND'
                $scope.loadIconStop()
            }
            else{
                $scope.chains = data;
                $scope.collapseAllExpiries()
                callback()
                $scope.loadIconStop()
                lastOptionsLoad = new Date()
                $scope.$apply()
            }
        });
        $scope.loadIconStart()
    }

    $scope.addLeg = () => {
        if($scope.stock.tickerChanged || isNaN(minutesSinceLastOptionsLoad()) || minutesSinceLastOptionsLoad() > 5){
            
            $scope.selectedOptions = []
            $scope.mergedOptions = {}
            $scope.display.profitTable = false;
            $scope.dataForChart = {};
            $scope.lineChartOptions.series = [];
            
            $scope.getPrice(false)
            $scope.getOptionsChain(() => {
                $scope.display.optionsSelection = true;
            })
        }
        else{
            $scope.display.optionsSelection = true;
        }
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

    $scope.mergeProfits = (optionsProfits, expiry) => {
        profitMap = []
        //console.log(optionsProfits)
        d = getCurrentDate()
        while(timeBetweenDates(expiryConvertToDate(expiry), d) > -1){
            profitMap.push([dateToString(d),$scope.rangeOfPrices.map(function(arr) {return arr.slice();})])
            for(price of profitMap[profitMap.length-1][1]){
                for(profitSet of optionsProfits){
                    price[1] += mapToObject(mapToObject(profitSet)[dateToString(d)])[price[0]]
                }
            }
            d = incrementOneDay(d)
        }
        return profitMap
    }

    $scope.mergeOptions = (callback) => {
        $scope.mergedOptions = {'boughtAt':0, 'expiry':"", 'greeks':{'delta':0, 'gamma':0, 'theta':0, 'vega':0, 'rho':0}, 'profit':{}}
        
        for (option of $scope.selectedOptions){
            $scope.mergedOptions.boughtAt += (option.isLong ? 1 : -1) * option.boughtAt * option.quantity
    
            $scope.mergedOptions.greeks.delta += option.greeks.delta * option.quantity
            $scope.mergedOptions.greeks.gamma += option.greeks.gamma * option.quantity
            $scope.mergedOptions.greeks.theta += option.greeks.theta * option.quantity
            $scope.mergedOptions.greeks.vega += option.greeks.vega * option.quantity
            $scope.mergedOptions.greeks.rho += option.greeks.rho * option.quantity
        }
        
        optionsProfits = $scope.selectedOptions.map(o => o.profit)

        $scope.mergedOptions.expiry = dateToString($scope.selectedOptions.map( o => expiryConvertToDate(o.expiry) ).sort(timeBetweenDates)[0])
        //console.log($scope.mergedOptions)

        $scope.mergedOptions.roundedProfit = []
        $scope.mergedOptions.profit = $scope.mergeProfits(optionsProfits, $scope.mergedOptions.expiry) 
        for(day of $scope.mergedOptions.profit){
            $scope.mergedOptions.roundedProfit.push([day[0], []])
            for(price of day[1]){
                $scope.mergedOptions.roundedProfit[$scope.mergedOptions.roundedProfit.length-1][1].push([roundPlaces(price[0], 2),roundPlaces(price[1], 2)])
            }
        }

        $scope.mergedOptions.percentProfit = []
        $scope.mergedOptions.profit = $scope.mergeProfits(optionsProfits, $scope.mergedOptions.expiry) 
        for(day of $scope.mergedOptions.profit){
            $scope.mergedOptions.percentProfit.push([day[0], []])
            for(price of day[1]){
                $scope.mergedOptions.percentProfit[$scope.mergedOptions.percentProfit.length-1][1].push([roundPlaces(price[0], 2)
                    ,(roundPlaces(price[1], 2)+$scope.mergedOptions.boughtAt)/Math.abs($scope.mergedOptions.boughtAt)
                    ,hexColorFromPercent( (roundPlaces(price[1], 2)+ Math.abs($scope.mergedOptions.boughtAt))/Math.abs($scope.mergedOptions.boughtAt)  ) ])
            }
        }

        console.log($scope.mergedOptions)
        callback()
    }

    $scope.calculateProfits = (callback) => {
        for(option of $scope.selectedOptions){
            option.greeks = calculateGreeks(option.timeTillExpiry, $scope.stock.price, option.strike, option.isCall, option.isLong, $scope.stock.freeRate, $scope.stock.divYield, option.iv)
            option.profit = []
            d = getCurrentDate()
            while(timeBetweenDates(expiryConvertToDate(option.expiry), d) > 0){
                option.profit.push([dateToString(d),$scope.rangeOfPrices.map(function(arr) {return arr.slice();})])
                for(price of option.profit[option.profit.length-1][1]){
                    price[1] = calculateOptionsPrice(percentageOfYear(timeBetweenDates(expiryConvertToDate(option.expiry), d)), price[0], option.strike, option.isCall, option.isLong, $scope.stock.freeRate, $scope.stock.divYield, option.ivEdited) 
                    price[1] -= option.boughtAt * (option.isLong?1:-1)
                    price[1] *= option.quantity
                }
                d = incrementOneDay(d)
            }

            //PROFIT AT EXPIRY
            option.profit.push([dateToString(d),$scope.rangeOfPrices.map(function(arr) {return arr.slice();})])
            for(price of option.profit[option.profit.length-1][1]){
                price[1] = calculateProfitAtExpiry(option.boughtAt, price[0], option.strike, option.isCall, option.isLong)
            }
            ////////////////
        }
        console.log($scope.selectedOptions)
        $scope.mergeOptions(callback)
    }

    $scope.displayProfit = () => {
        $scope.dataForChart = {};
        $scope.lineChartOptions.series = [];
        $scope.loadIconStart()
        
        $scope.calculateProfits(() => {
            $scope.display.profitTable = true;
            $scope.addLineChartData()
            $scope.loadIconStop()
        })
    }

    $scope.addLineChartData = () =>{
        interval = Math.round($scope.mergedOptions.profit.length/8)
        interval = interval > 0 ? interval : 1
        for(i = $scope.mergedOptions.profit.length-1; i > 0; i-=interval){
            $scope.dataForChart["dataset"+[i]] = $scope.mergedOptions.profit[i][1].map((x)=> {return {"x":x[0], "y":x[1]}})
            $scope.lineChartOptions.series.push({
                axis: "y",
                dataset: "dataset"+i,
                key: "y",
                label: "",
                color: "rgb(" + Math.round(140 * i / $scope.mergedOptions.profit.length) + "," + Math.round(255 * i / $scope.mergedOptions.profit.length) + "," + Math.round(255 * i / $scope.mergedOptions.profit.length) + ")",
                type: ['line', 'dot'],
                id: 'profitAtExpiry'+i
            })
        }
    }

    $scope.dataForChart = {};

    $scope.lineChartOptions = {
        series: [],
        tooltipHook: function(d){
            return {
              abscissas: "",
              rows:  d.map(function(s){
                return {
                  label: s.row.x + " ==> ",
                  value: s.row.y1,
                  color: s.series.color
                }
              })
            }
        },
        axes: {x: {key: "x" //, ticks: "dataset".length
        }}
      };

    $scope.init = () => {
        //Things to do on init
    }

    $scope.init()

})