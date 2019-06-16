var stockticker, stockdata;
var notFound = {'price':'NOT FOUND', 'change':'NOT FOUND'}
$(document).ready(function(){
  
    $("#submitTicker").click(function(){
      if(stockticker != $("#ticker").val()){
        stockticker=$("#ticker").val();
        $.post("/price",{ticker: stockticker}, function(data){
              //do things with data returned from app js
              console.log(data)
              if('error' in data || 'unmatched_symbols' in data || data == null){
                data = notFound
              }
              displayData(data.price, data.change)
              keepData(data)
              loadIconStop()
        });
        loadIconStart()
      }
      else{
        displayData(stockdata.price, stockdata.change)
      }
    });

});

function keepData(ndata){
  stockdata = ndata
}

function displayData(price, change){
  $("#price").val(price)
  $("#percentChange").val(change + " %")
}