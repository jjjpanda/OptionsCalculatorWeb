$(document).ready(function(){
    var ticker;
    $("#submit").click(function(){
      ticker=$("#ticker").val();
      $.post("/",{ticker: ticker}, function(data){
            alert(data)
      });
    });
  });