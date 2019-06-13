 $(document).ready(function(){
    var ticker;
    $("#submit").click(function(){
      ticker=$("#ticker").val();
      $.post("/price",{ticker: ticker}, function(data){
            //do things with data returned from app js
            if(data.error == true || data.unmatched_symbols != undefined){
              data = 'NOT FOUND'
            }
            $("#iv").val(data)
      });
    });

    $("#chain").click(function(){
      ticker=$("#ticker").val();
      $.post("/chain",{ticker: ticker}, function(data){
            //do things with data returned from app js
            console.log(data)
      });
    });

  });