function loadIconStart(){
    $("#loadingIcon").css('visibility', 'visible')
}

function loadIconStop(){
    $("#loadingIcon").fadeOut(200, function(){
        $("#loadingIcon").css('display','inline')
        $("#loadingIcon").css('visibility','hidden')
    })
}

function loadIconInBoxStart(pointer){
    pointer.addClass('loadingInBox')
}

function loadIconInBoxStop(pointer){
    pointer.removeClass('loadingInBox')
}