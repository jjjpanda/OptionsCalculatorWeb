var chainticker, chaindata; 
var optionsSelected = []

$(document).ready(function(){

    $(addLegButton).click(function(){
      addLegClick(chaindata, chainticker)
    });

});

function addLegClick(chaindata, chainticker){
  if(chainticker != $(tickerTextInput).val() || minutesSinceLastLoad() > 5){
      if(chainticker != $(tickerTextInput).val()){
          $(bottomRows).empty()
          optionsSelected = []
      }
      chainticker=$(tickerTextInput).val();
      getPrice(false)
      $.post("/chain",{ticker: chainticker}, function(data){
      //do things with data returned from app js
      console.log(data)
      if(data == null || data == undefined || data.hasOwnProperty('error')){
          data = 'NOT FOUND'
          loadIconStop()
      }
      else{
          addOptionsChain(data, function(){
          loadIconStop()
          $(modalDiv).css("display", "block")
          })
      }
      keepChain(data, chainticker)
      });
      loadIconStart()
  }
  else{
  loadIconStart()
  addOptionsChain(chaindata, function(){
      loadIconStop()
      $(modalDiv).css("display", "block")
  })
  }
}

function keepChain(ndata, nchainticker){
  chaindata = ndata;
  chainticker = nchainticker
}

function addOptionsChain(data, callback){
  expiries = Object.keys(data);
  $(optionsChainDIV)[0].innerHTML = "<span id=\"close\">&times;</span>";
  for(expiry of expiries){
    $(optionsChainDIV)[0].appendChild(createChainDiv(expiry, data[expiry]))
  }
  addCollapsers()
  addCloseListener()
  callback()
}

function createChainDiv(expiry, optionsChain){
  optionsChain = sortedChain(optionsChain);

  var chainDiv = document.createElement("div")
  chainDiv.className = "chain"
  
  var expirySelection = document.createElement('button')
  expirySelection.className = "collapse" 
  expirySelection.innerText = expiry

  var chainContent = document.createElement('table')
  chainContent.className = "collapseContent"
  chainContent.style.display = 'none'

  tableHead = document.createElement('thead')
  chainContent.appendChild(tableHead)
  tableBody = document.createElement("tbody")
  chainContent.appendChild(tableBody)

  var headRow = createHeaderRow()
  tableHead.appendChild(headRow)

  for(option of optionsChain){
    addToRow(tableBody, option)
  }
  
  chainDiv.appendChild(expirySelection)
  chainDiv.appendChild(chainContent)
  
  return chainDiv
}

var arrayOfHeaders = ['Bid', 'Call', 'Ask', 'Strike', 'Bid', 'Put', 'Ask']

function createHeaderRow(){
  var row = document.createElement('tr')
  for(header of arrayOfHeaders){
    var head = document.createElement('th')
    head.innerText = header
    row.appendChild(head)
  }
  return row;
}

function anchorCreator(inner){
  var ele = document.createElement('a');
  ele.innerText = inner;
  addAnchorListener(ele)
  return ele;
}

function addToRow(table, optionObj){
  if(table.getElementsByClassName(optionObj.strike).length == 0){
    var row = document.createElement('tr')
    row.className = optionObj.strike;
    for(header of arrayOfHeaders){
      row.appendChild(document.createElement('td'))
    }
    if(optionObj.type == "call"){
      row.children[0].appendChild(anchorCreator(optionObj.bid))
      row.children[1].appendChild(anchorCreator(((optionObj.bid+optionObj.ask)/2).toFixed(2)))
      row.children[2].appendChild(anchorCreator(optionObj.ask))
    }
    else if(optionObj.type == "put"){
      row.children[4].appendChild(anchorCreator(optionObj.bid))
      row.children[5].appendChild(anchorCreator(((optionObj.bid+optionObj.ask)/2).toFixed(2)))
      row.children[6].appendChild(anchorCreator(optionObj.ask))
    }
    row.children[3].appendChild(anchorCreator(optionObj.strike));
    table.appendChild(row)
  }
  else{
    row = table.getElementsByClassName(optionObj.strike)[0]
    if(optionObj.type == "call"){
      row.children[0].appendChild(anchorCreator(optionObj.bid))
      row.children[1].appendChild(anchorCreator(((optionObj.bid+optionObj.ask)/2).toFixed(2)))
      row.children[2].appendChild(anchorCreator(optionObj.ask))
    }
    else if(optionObj.type == "put"){
      row.children[4].appendChild(anchorCreator(optionObj.bid))
      row.children[5].appendChild(anchorCreator(((optionObj.bid+optionObj.ask)/2).toFixed(2)))
      row.children[6].appendChild(anchorCreator(optionObj.ask))
    }
  }
}

function sortedChain(arr){
  return arr.sort(function(a, b) {
    return a.strike - b.strike;
  });
}

function closeEverythingBut(index){
  var coll = document.getElementsByClassName("collapse");
  for (i = 0; i < coll.length; i++) {
    if(coll[i] != index){
      coll[i].classList.toggle("active");
      coll[i].nextSibling.style.display = 'none';
    }
  }
}

function individualOptionRow(){
  ele = document.createElement('div')
  ele.id = anchorID;
  ele.className = "bottomRow"
  return ele;
}

var anchorID = 0;

function addOptionsRow(price, type, strike, expiry){
  $(bottomRows)[0].appendChild(individualOptionRow())
  $(bottomRows)[0].appendChild(document.createElement("br"))
  //var num = ($(bottomRows)[0].children.length-2)/2
  $("#"+anchorID).load('/js/html/optionDetailRow.html', function(){
    $("#"+anchorID)[0].children[0].children[0].id += anchorID
    $("#"+anchorID)[0].children[0].children[1].htmlFor += anchorID
    $("#"+anchorID)[0].children[6].id += anchorID
    $("#"+anchorID)[0].children[1].value = expiryToString(expiry) + " $" + strike + " " + type
    $("#"+anchorID)[0].children[5].value = price
    optionsSelected.push({'expiry':expiry, 'strike':strike, 'type':type, 'price':price, 'pointerToRow':$("#"+anchorID)[0]})
    addOptionRowListener($("#"+anchorID)[0].children[6], $("#"+anchorID)[0])
    anchorID++;
  })
}

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
    $(closeButton).click(function(){
        $(modalDiv).css("display", "none")
    });  

    /*
    $(modalDiv).click(function(){
        if($(modalDiv).css("display") == "block"){
        $(modalDiv).css("display", "none") 
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
        $(closeButton).click()
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