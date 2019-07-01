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

    $scope.stock = {'price':'', 'percentChange':''}
    $scope.selectedOptions = []
    $scope.mergedOptions = {"profit":{'date1':{1:2,2:4,3:8}, 'date2':{1:3,2:6, 3:9}}}

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

    $scope.selectOption = ($event, price, strike, expiry) => {
        console.log($event)
        console.log(price)
        console.log(strike)
        console.log(expiry)
        $scope.selectedOptions.push({"isLong":true, "boughtAt":price, "name":expiry+" "+strike})
    }

    $scope.openExpiry = () => {
        //Close all collapse contents
        //open targeted collapsed 
    }

    $scope.closeModal = () => {
        //close modal
    }

    $scope.calculateProfits = () => {

    }

    $scope.removeLeg = () => {

    }

    $scope.editLeg = () => {
        
    }

})