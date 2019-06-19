$(document).ready(function(){
    $("#calculateOptions").click(function(){
        loadIconStart()
        getOptionsData(optionsSelected, function(){
            loadIconStop()
        })
    });
});

function getOptionsData(arrayOfOptions, callback){
    arrayOfRows = $(".bottomRow")
    for(i = 0; i < arrayOfRows.length; i++){
        arrayOfOptions[i].boughtAt = arrayOfRows[i].children[5].value
        arrayOfOptions[i].buy = arrayOfRows[i].children[0].children[0].checked
        arrayOfOptions[i].quantity = arrayOfRows[i].children[3].value
    }
    calculate(arrayOfOptions)
    callback()
}

function calculate(options){
    
}
