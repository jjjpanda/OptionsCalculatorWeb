
var app = angular.module("angApp", ['n3-line-chart']);
app.controller("appController", function($scope){
    $scope.stock = {'ticker':'','price':'', 'historical':[], 'percentChange':'', "tickerChangedForStock": false}
    $scope.display = {'loadingIcon':false}

    $scope.redirectTo = (data) => {
        window.location.href = data
    }

    $scope.loadIconStart = () => {
        $scope.display.loadingIcon = true;
    }

    $scope.loadIconStop = () => {
        $scope.display.loadingIcon = false;
    }

    $scope.stockChartOptions = {
        series: [{
            axis: "y",
            dataset: "dataset",
            key: "close",
            label: "Price",
            color: '#ffffff',
            type: ['line'],
            id: 'priceHistorical',
            visible: false
        },{
            axis: "y2",
            dataset: "dataset",
            key: "volume",
            label: "Volume",
            color: '#aaaabb',
            type: ['column'],
            id: 'volumeHistorical',
            visible: false
        }],
        axes: {x: {key: "date", ticks: "dataset".length, type: 'date'
        },  y: {key: 'close', 
                tickFormat: (value) => {
                return "$"+ value
        }},
        y2: {key:'volume', tickFormat: (value) => {
            return ""
        }   
        }},
        tooltipHook: function(d){
            if(d == undefined){ return }
            return {
              abscissas: "",
              rows:  d.map(function(s){
                if(s.series.label == 'Volume'){
                    return {
                        label: s.series.label + ": " + dateToString(s.row.x) + " -",
                        value: s.row.y1,
                        color: s.series.color
                    }
                }
                return {
                  label: s.series.label + ": " + dateToString(s.row.x) + " -",
                  value: '$ '+$scope.roundPlaces(s.row.y1,2),
                  color: s.series.color
                }
              })
            }
        },
        grid: {
            x: false,
            y: false
        }
    };

    $scope.getPrice = (showLoadingIcon) => {
        if($scope.stock.tickerChangedForStock || isNaN(minutesSinceLastPriceLoad()) || minutesSinceLastPriceLoad() > 5){
            $.post("/price",{ticker: $scope.stock.tickerSymbol}, function(data){
                //do things with data returned from app js
                console.log(data)
                if( data == null || data.hasOwnProperty('error') || data.hasOwnProperty('unmatched_symbols' )){
                    data = notFound
                }
                $scope.stock.price = data.price
                $scope.stock.percentChange = data.change
                if(showLoadingIcon) {$scope.loadIconStop()}
                lastPriceLoad = new Date()
                $scope.$apply()
            });
            if(showLoadingIcon) {$scope.loadIconStart()} 
            $scope.stock.tickerChangedForStock = false;
            $.post('/historical', {ticker: $scope.stock.tickerSymbol}, function(data){
                console.log(data)
                $scope.stock.historical.dataset = data.map(x=> { return {date: expiryConvertToDate(x.date), close: x.close, volume:x.volume} })
                console.log($scope.stock.historical)
            }).then($scope.stockChartOptions.series = [{
                    axis: "y",
                    dataset: "dataset",
                    key: "close",
                    label: "Price",
                    color: '#ffffff',
                    type: ['line'],
                    id: 'priceHistorical',
                    visible: false
                },{
                    axis: "y2",
                    dataset: "dataset",
                    key: "volume",
                    label: "Volume",
                    color: '#6988ee',
                    type: ['column'],
                    id: 'volumeHistorical',
                    visible: false
                }])
        } 
    }

    $scope.roundPlaces = (i, x) => {
        return Math.round( i * Math.pow(10,x)) / Math.pow(10,x)
    }
})