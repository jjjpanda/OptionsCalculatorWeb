$(document).ready(function(){
    $("#calculateOptions").click(function(){
        loadIconStart()
        $('#jsonOutput').empty()
        getOptionsData(optionsSelected, function(calculatedOptions, mergedOptions){
            profitToTable(calculatedOptions, mergedOptions)
            loadIconStop()
        })
    });
});

function profitToTable(calculatedOptions, mergedOptions){
    console.log(calculatedOptions)
    console.log(mergedOptions)
    $('#jsonToTable')
    
}