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
    $scope.submitDetails = {'percentInterval':1, "numberOfIntervals":15}
    $scope.display = {"loadingIcon":false, "optionsSelection":false, "expandedExpiries":{}, "profitTable":false, "optionsStrategyInfo":false}
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
            $scope.display.optionsStrategyInfo = false;
            $scope.resetCharts()
            
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
        option.name = expiryToString(option.expiry) + " $" + option.strike + " " + (option.isCall ? "Call" : "Put")
        option.id = currentBiggestID++
        option.iv = calculateIV(option.timeTillExpiry, option.price, $scope.stock.price, option.strike, option.isCall, $scope.stock.freeRate, $scope.stock.divYield)
        option.ivEdited = option.iv

        console.log(option)
        $scope.selectedOptions.push(option)
        $scope.closeModal()
    }

    $scope.closeModal = () => {
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

    $scope.roundPlaces = (i, x) => {
        return Math.round( i * Math.pow(10,x)) / Math.pow(10,x)
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
       
        ///THIS MAY BE DELETED 
        /*
        $scope.mergedOptions.roundedProfit = []
        $scope.mergedOptions.profit = $scope.mergeProfits(optionsProfits, $scope.mergedOptions.expiry) 
        for(day of $scope.mergedOptions.profit){
            $scope.mergedOptions.roundedProfit.push([day[0], []])
            for(price of day[1]){
                $scope.mergedOptions.roundedProfit[$scope.mergedOptions.roundedProfit.length-1][1].push([$scope.roundPlaces(price[0], 2),$scope.roundPlaces(price[1], 2)])
            }
        }
        */  

        $scope.mergedOptions.percentProfit = []
        $scope.mergedOptions.profit = $scope.mergeProfits(optionsProfits, $scope.mergedOptions.expiry) 
        for(day of $scope.mergedOptions.profit){
            $scope.mergedOptions.percentProfit.push([day[0], []])
            for(price of day[1]){
                $scope.mergedOptions.percentProfit[$scope.mergedOptions.percentProfit.length-1][1].push([$scope.roundPlaces(price[0], 2)
                    ,($scope.roundPlaces(price[1], 2)+$scope.mergedOptions.boughtAt)/Math.abs($scope.mergedOptions.boughtAt)
                    ,hexColorFromPercent( ($scope.roundPlaces(price[1], 2)+ Math.abs($scope.mergedOptions.boughtAt))/Math.abs($scope.mergedOptions.boughtAt)  ) ])
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
                price[1] *= option.quantity
            }
            ////////////////
        }
        console.log($scope.selectedOptions)
        $scope.mergeOptions(callback)
    }

    $scope.displayProfit = () => {
        $scope.loadIconStart()
        $scope.resetCharts()
        
        $scope.calculateProfits(() => {
            $scope.display.profitTable = true;
            $scope.display.optionsStrategyInfo = true;
            $scope.addLineChartData()
            $scope.loadIconStop()
        })
    }

    $scope.resetCharts = () => {
        $scope.dataForChart = {};
        $scope.lineChartOptions.series = [];
        $scope.dataForChart2 = {};
        $scope.lineChartOptions2.series = [];
    }

    $scope.addLineChartData = () =>{
        
        interval = Math.ceil($scope.mergedOptions.profit.length/7)
        interval = interval > 0 ? interval : 1
        
        for(i = $scope.mergedOptions.profit.length-1; i > 0; i-=interval){
            
            //CHART 1
            k = 0
            for(j = 0; j < $scope.mergedOptions.profit[i][1].length; j++){
                if(j==0 || Math.sign($scope.mergedOptions.profit[i][1][j-1][1]) != Math.sign($scope.mergedOptions.profit[i][1][j][1]) ){
                    k++
                    $scope.dataForChart["dataset"+[i]+" "+[k]] = []
                    $scope.lineChartOptions.series.push({
                        axis: "y",
                        dataset: "dataset"+i+" "+k,
                        key: "y",
                        label: $scope.mergedOptions.profit[i][0],
                        color: (Math.sign($scope.mergedOptions.profit[i][1][j][1]) == 1) ? ("rgb(" + Math.round(100 * i / $scope.mergedOptions.profit.length) + "," + Math.round(255 * i / $scope.mergedOptions.profit.length) + "," + Math.round(100 * i / $scope.mergedOptions.profit.length) + ")") : ("rgb(" + Math.round(255 * i / $scope.mergedOptions.profit.length) + "," + Math.round(100 * i / $scope.mergedOptions.profit.length) + "," + Math.round(100 * i / $scope.mergedOptions.profit.length) + ")"),
                        defined: function(value) {
                            return value != undefined || value.y != undefined;
                        },
                        type: ['line', 'dot'],
                        id: 'profitAtExpiry'+i+" "+k
                    })
                    if(k > 0 && j>0 && j < $scope.mergedOptions.profit[i][1].length){
                        $scope.dataForChart["dataset"+[i]+" "+[k+0.5]] = [{"x":$scope.mergedOptions.profit[i][1][j-1][0] , "y":$scope.mergedOptions.profit[i][1][j-1][1]},
                                                                    {"x":$scope.mergedOptions.profit[i][1][j][0] , "y":$scope.mergedOptions.profit[i][1][j][1]}]
                        $scope.lineChartOptions.series.push({
                            axis: "y",
                            dataset: "dataset"+i+" "+(k+0.5),
                            key: "y",
                            label: "intermediate",
                            color: "rgb(" + Math.round(255 * i / $scope.mergedOptions.profit.length) + "," + Math.round(255 * i / $scope.mergedOptions.profit.length) + "," + Math.round(255 * i / $scope.mergedOptions.profit.length) + ")",
                            defined: function(value) {
                                return value != undefined || value.y != undefined;
                            },
                            type: ['line', 'dot'],
                            id: 'profitAtExpiry'+i+" "+(k+0.5)
                        })
                    }
                }
                $scope.dataForChart["dataset"+[i]+" "+[k]].push( {"x":$scope.mergedOptions.profit[i][1][j][0] , "y":$scope.mergedOptions.profit[i][1][j][1]} )   
            }  

            //CHART 2
            $scope.dataForChart2["dataset"+[i]] = $scope.mergedOptions.profit[i][1].map((x)=> {return {"x":x[0], "y":x[1]}})
            $scope.lineChartOptions2.series.push({
                axis: "y",
                dataset: "dataset"+i,
                key: "y",
                label: $scope.mergedOptions.profit[i][0],
                color: "rgb(" + Math.round(140 * i / $scope.mergedOptions.profit.length) + "," + Math.round(255 * i / $scope.mergedOptions.profit.length) + "," + Math.round(255 * i / $scope.mergedOptions.profit.length) + ")",
                type: ['line', 'dot'],
                id: 'profitAtExpiry'+i
            })
            
        }
        
        $scope.lineChartOptions.series = $scope.lineChartOptions.series.reverse()
        $scope.lineChartOptions2.series = $scope.lineChartOptions2.series.reverse()
        
        $scope.lineChartOptions.symbols[1].value = $scope.stock.price
        $scope.lineChartOptions2.symbols[1].value = $scope.stock.price

    }

    $scope.dataForChart = {};
    $scope.dataForChart2 = {};

    $scope.lineChartOptions = {
        series: [],
        tooltipHook: function(d){
            //return false
            if(d == undefined){}
            else {
                return {
                abscissas: "Profit from Present to Expiry",
                rows:  
                    d.filter(s => (s.series.label !== "intermediate")).map(function(s){  
                        return {
                            label: s.series.label + " & " + $scope.roundPlaces(s.row.x,2) + " => ",
                            value: "$ " + s.row.y1,
                            color: ""
                        }
                    })
                }
            }
        },
        axes: {x: {key: "x" //, ticks: "dataset".length
        },  y: {key: 'y', interpolation: { mode: "bundle", tension: 0.7}, 
                tickFormat: (value) => {
                return "$"+value
            }
        }
        },
        symbols: [{
            type: 'hline',
            value: 0,
            color: 'rgb(255,255,255)',
            axis: 'y'
        },{
            type: 'vline',
            value: $scope.stock.price,
            color: 'rgb(255,255,255)',
            axis: 'x'
        }],
        grid: {
            x: false,
            y: false
        }
    };
    $scope.lineChartOptions2 = {
        series: [],
        tooltipHook: function(d){
            if(d == undefined){}
            else {
                return {
                abscissas: "Profit from Present to Expiry",
                rows:  
                    d.map(function(s){
                        return {
                            label: $scope.roundPlaces(s.row.x,2) + " => ",
                            value: "$ " + s.row.y1,
                            color: s.series.color
                        }
                    })
                }
            }
        },
        axes: {x: {key: "x"//, ticks: "dataset".length
        },  y: {key: 'y', interpolation: { mode: "bundle", tension: 0.7}, tickFormat: (value) => {
                return "$"+value
            }
        }
        },
        symbols: [{
            type: 'hline',
            value: 0,
            color: 'rgb(255,255,255)',
            axis: 'y'
        },{
            type: 'vline',
            value: $scope.stock.price,
            color: 'rgb(255,255,255)',
            axis: 'x'
        }
        ],
        grid: {
            x: false,
            y: false
        }
    };

    $scope.init = () => {
        //Things to do on init
    }

    $scope.init()

})