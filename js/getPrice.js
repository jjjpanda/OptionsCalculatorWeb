$(document).ready(function(){
    var ticker;

    $("#submitTicker").click(function(){
      ticker=$("#ticker").val();
      $.post("/price",{ticker: ticker}, function(data){
            //do things with data returned from app js
            loadIconInBoxStop($('#price'))
            if(data.error != undefined || data.unmatched_symbols != undefined){
              data = 'NOT FOUND'
            }
            $("#price").val(data)
            console.log(data)
      });
      loadIconInBoxStart($('#price'))
    });

});