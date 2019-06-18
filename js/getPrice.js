var stockticker, stockdata, lastLoad;
var notFound = {'price':'NOT FOUND', 'change':'NOT FOUND'}

function getPrice(runIcons){
  if(stockticker != $("#ticker").val() || minutesSinceLastLoad() > 5){
    stockticker=$("#ticker").val();
    $.post("/price",{ticker: stockticker}, function(data){
          //do things with data returned from app js
          console.log(data)
          if('error' in data || 'unmatched_symbols' in data || data == null){
            data = notFound
          }
          displayData(data.price, data.change)
          keepData(data)
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

$(document).ready(function(){
    $("#submitTicker").click(function(){
      getPrice(true)
    });
});

function keepData(ndata){
  stockdata = ndata
}

function displayData(price, change){
  $("#price").val(price)
  $("#percentChange").val(change + " %")
}

function minutesSinceLastLoad(){
  return (new Date() - lastLoad) / (1000*60)
}
