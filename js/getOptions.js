var chainticker, chaindata, savedInnerHTML;
 $(document).ready(function(){
  
    $('#calculateOptions').click(function(){
      addOptionsRow()
    })

    $("#chain").click(function(){
      if(chainticker != $("#ticker").val() || minutesSinceLastLoad() > 5){
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

function anchorCreator(inner){
  var ele = document.createElement('a');
  ele.innerText = inner;
  addAnchorListener(ele)
  return ele;
}

function addAnchorListener(pointer){
  pointer.addEventListener("click", function(){
    console.log(pointer.parentElement.parentElement.className)
    console.log(pointer.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].innerText)
  })
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

function closeEverythingBut(index){
  var coll = document.getElementsByClassName("collapse");
  for (i = 0; i < coll.length; i++) {
    if(coll[i] != index){
      coll[i].classList.toggle("active");
      coll[i].nextSibling.style.display = 'none';
    }
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

function individualOptionRow(){
  ele = document.createElement('div')
  ele.className = "bottomRow"+a
  return ele;
}

var a = 0;

function addOptionsRow(){
  $("#bottomRows")[0].appendChild(individualOptionRow())
  $("#bottomRows")[0].appendChild(document.createElement("br"))
  //var num = ($("#bottomRows")[0].children.length-2)/2
  $(".bottomRow"+a).load('/js/html/optionDetailRow.html', function(){
    $(".bottomRow"+a)[0].children[0].children[0].id += a
    $(".bottomRow"+a)[0].children[0].children[1].htmlFor += a
    $(".bottomRow"+a)[0].children[6].id += a
    addOptionRowListener($(".bottomRow"+a)[0].children[6], $(".bottomRow"+a)[0])
    a++;
  })
}

function addOptionRowListener(btnPointer, rowPointer){
  btnPointer.addEventListener("click", function(){
    rowPointer.nextSibling.remove()
    rowPointer.remove();
  })

}
