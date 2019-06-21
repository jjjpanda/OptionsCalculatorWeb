$(document).ready(function(){
    $("#calculateOptions").click(function(){
        loadIconStart()
        $('#jsonOutput').empty()
        getOptionsData(optionsSelected, function(){
            loadIconStop()
        })
    });
});