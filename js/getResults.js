$(document).ready(function(){
    $("#calculateOptions").click(function(){
        loadIconStart()
        $('#jsonOutput').empty()
        getOptionsData(optionsSelected, function(calculatedOptions){
            profitToTable(calculatedOptions)
            loadIconStop()
        })
    });
});

function profitToTable(calculatedOptions){
    console.log(calculatedOptions)
    $('#jsonToTable')
    
}