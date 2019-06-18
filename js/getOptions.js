var chainticker, chaindata, savedInnerHTML;
 $(document).ready(function(){
    
    $("#chain").click(function(){
      if(chainticker != $("#ticker").val()){
        chainticker=$("#ticker").val();
        getPrice(false)
        $.post("/chain",{ticker: chainticker}, function(data){
          //do things with data returned from app js
          console.log(data)
          if('error' in data || data == null || data == undefined){
            data = 'NOT FOUND'
            loadIconStop()
          }
          else{
            addOptionsChain(data, function(){
              loadIconStop()
              keepInnerHTML()
              $("#modal").css("display", "block")
            })
          }
          keepChain(data)
        });
        loadIconStart()
      }
      else{
        loadIconStart()
        addOptionsChainFromSaved(function(){
          loadIconStop()
          $("#modal").css("display", "block")
        })
      }
     
    });

});

function keepChain(ndata){
  chaindata = ndata;
}

function keepInnerHTML(){
  savedInnerHTML = getOptionsMenu().innerHTML;
}

function addOptionsChainFromSaved(callback){
  getOptionsMenu().innerHTML = savedInnerHTML
  addCollapsers()
  addCloseListener()
  callback()
}

function addOptionsChain(data, callback){
  expiries = Object.keys(data);
  getOptionsMenu().innerHTML = "<span id=\"close\">&times;</span>";
  for(expiry of expiries){
    getOptionsMenu().appendChild(createChainDiv(expiry, data[expiry]))
  }
  addCollapsers()
  addCloseListener()
  callback()
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
