// OPTIONS CHAIN TABLE

function addCollapsers(){
var coll = document.getElementsByClassName("collapse");
var i;
for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextSibling
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
            closeEverythingBut(this)
        }
    });
}
}

function addCloseListener(){
    $("#close").click(function(){
        $("#modal").css("display", "none")
    });  

    /*
    $("#modal").click(function(){
        if($("#modal").css("display") == "block"){
        $("#modal").css("display", "none") 
        }
    })
    */
}

function addAnchorListener(pointer){
    pointer.addEventListener("click", function(){
        price = pointer.innerText
        type = $(pointer.parentElement).index()
        if([0,1,2].includes(type)){
            type = 'Call'
            price = pointer.parentElement.parentElement.children[1].innerText
        }
        if ([4,5,6].includes(type)){
            type = 'Put'
            price = pointer.parentElement.parentElement.children[5].innerText
        }
            strike = pointer.parentElement.parentElement.className
            expiry = pointer.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].innerText
        $("#close").click()
        if(type != 3){
            addOptionsRow(price, type, strike, expiry)
        }
    })
}

function addOptionRowListener(btnPointer, rowPointer){
    btnPointer.addEventListener("click", function(){
        optionsSelected.splice($(rowPointer).index()/2, 1)
        rowPointer.nextSibling.remove()
        rowPointer.remove();
    })
}