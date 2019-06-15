 $(document).ready(function(){
    var ticker;

    $("#submit").click(function(){
      ticker=$("#ticker").val();
      $.post("/price",{ticker: ticker}, function(data){
            //do things with data returned from app js
            if(data.error != undefined || data.unmatched_symbols != undefined){
              data = 'NOT FOUND'
            }
            $("#price").val(data)
            console.log(data)
      });
    });

    $("#chain").click(function(){
      ticker=$("#ticker").val();
      $.post("/chain",{ticker: ticker}, function(data){
            //do things with data returned from app js
            if(data.error != undefined || data == null || data == undefined){
              data = 'NOT FOUND'
            }
            else{
              addOptionsChain(data)
            }
            console.log(data)
      });
    });

    
});

function addOptionsChain(data){
  expiries = Object.keys(data);
  getOptionsMenu().innerHTML = "";
  for(expiry of expiries){
    getOptionsMenu().appendChild(createChainDiv(expiry, data[expiry]))
  }
  addCollapsers()
}

function getOptionsMenu(){ 
  return $("#options")[0]
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

function addToRow(table, optionObj){
  if(table.getElementsByClassName(optionObj.strike).length == 0){
    var row = document.createElement('tr')
    row.className = optionObj.strike;
    for(header of arrayOfHeaders){
      row.appendChild(document.createElement('td'))
    }
    if(optionObj.type == "call"){
      row.children[0].innerText = optionObj.bid
      row.children[1].innerText = ((optionObj.bid+optionObj.ask)/2).toFixed(2)
      row.children[2].innerText = optionObj.ask
    }
    else if(optionObj.type == "put"){
      row.children[4].innerText = optionObj.bid
      row.children[5].innerText = ((optionObj.bid+optionObj.ask)/2).toFixed(2)
      row.children[6].innerText = optionObj.ask
    }
    row.children[3].innerText=optionObj.strike;
    table.appendChild(row)
  }
  else{
    row = table.getElementsByClassName(optionObj.strike)[0]
    if(optionObj.type == "call"){
      row.children[0].innerText = optionObj.bid
      row.children[1].innerText = ((optionObj.bid+optionObj.ask)/2).toFixed(2)
      row.children[2].innerText = optionObj.ask
    }
    else if(optionObj.type == "put"){
      row.children[4].innerText = optionObj.bid
      row.children[5].innerText = ((optionObj.bid+optionObj.ask)/2).toFixed(2)
      row.children[6].innerText = optionObj.ask
    }
  }
}

function sortedChain(arr){
  return arr.sort(function(a, b) {
    return a.strike - b.strike;
  });
}

function addCollapsers(){
  var coll = document.getElementsByClassName("collapse");
  var cont = document.getElementsByClassName('collapseContent')
  var i;
  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var content = this.nextSibling
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  }
}