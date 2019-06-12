$(document).ready(function(){
    var ticker;
    $("#submit").click(function(){
      ticker=$("#ticker").val();
      $.post("app.js",{ticker: ticker}, function(data){
            alert(data)
      });
    });
  });