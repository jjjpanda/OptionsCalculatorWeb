function loadIconStart(){
    $("#loadingIcon").css('visibility', 'visible')
}

function loadIconStop(){
    $("#loadingIcon").fadeOut(200, function(){
        $("#loadingIcon").css('display','inline')
        $("#loadingIcon").css('visibility','hidden')
    })
}