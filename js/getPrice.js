var stockticker, stockdata, lastLoad;
var notFound = {'price':'NOT FOUND', 'change':'NOT FOUND'}

$(document).ready(function(){
  $("#submitTicker").click(function(){
    getPrice(true)
  });
});

function getPrice(runIcons){
  if(stockticker != $("#ticker").val() || minutesSinceLastLoad() > 5){
    stockticker=$("#ticker").val();
    $.post("/price",{ticker: stockticker}, function(data){
          //do things with data returned from app js
          console.log(data)
          if( data == null || data.hasOwnProperty('error') || data.hasOwnProperty('unmatched_symbols' )){
            data = notFound
          }
          displayData(data.price, data.change)
          keepStockData(data)
          lastLoad = new Date()
          if(runIcons){
            loadIconStop()
          }
    });
    if(runIcons){
      loadIconStart()
    }
  }
  else{
    displayData(stockdata.price, stockdata.change)
  }
}

function keepStockData(ndata){
  stockdata = ndata
}

function displayData(price, change){
  $("#price").val(price)
  $("#percentChange").val(change + " %")
}

function minutesSinceLastLoad(){
  return (new Date() - lastLoad) / (1000*60)
}