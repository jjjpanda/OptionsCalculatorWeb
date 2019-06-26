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

    profitTable = document.createElement('table')
    profitTableHead = document.createElement("thead")
    profitTableBody = document.createElement("tbody")

    profitTable.appendChild(profitTableHead)
    profitTable.appendChild(profitTableBody)

    addOptionHeaderRow(profitTableHead, Object.keys(mergedOptions.profit[Object.keys(mergedOptions.profit)[0]]))
    addOptionDateRows(profitTableBody, Object.keys(mergedOptions.profit))
    addProfitInDateRows(profitTableBody, mergedOptions.profit, mergedOptions.boughtAt)

    $('#jsonToTable')[0].appendChild(profitTable)

    jsonContainer = document.createElement('pre')
    jsonContainer.innerText = expiryToString(mergedOptions.expiry) + "\n" + JSON.stringify(mergedOptions.profit, undefined, 2)
    $('#jsonOutput')[0].appendChild(jsonContainer)

    for(option of calculatedOptions){
        jsonContainer = document.createElement('pre')
        jsonContainer.innerText = expiryToString(option.expiry) + " $" + option.strike + " " + option.type + "\n" + JSON.stringify(option.profit, undefined, 2)
        $('#jsonOutput')[0].appendChild(jsonContainer)
    }

}

function addOptionHeaderRow(pointer, prices){
    topRow = document.createElement('tr')

    priceInRow = document.createElement('th')
    priceInRow.innerText = "-----"
    topRow.appendChild(priceInRow)

    for(price of prices.sort()){
        priceInRow = document.createElement('th')
        priceInRow.innerText = price
        topRow.appendChild(priceInRow)
    }
    pointer.appendChild(topRow)
}

function addOptionDateRows(pointer, dates){
    for(date of dates){
        dateRow = document.createElement('tr')
        $(dateRow).data('date', date)
        dateInRow = document.createElement('td')
        dateInRow.innerText = dateToString(new Date(date))
        dateRow.appendChild(dateInRow)
        pointer.appendChild(dateRow)
    }
}

function addProfitInDateRows(pointer, profits, initialCost){
    for( row of pointer.getElementsByTagName('tr')){

        for(price of Object.keys(profits[$(row).data('date')])){
            priceObj = document.createElement('td')
            priceObj.style.border = hexColorFromPercent((profits[$(row).data('date')][price]+initialCost)/initialCost )            
            priceObj.innerText = roundTwoPlaces(profits[$(row).data('date')][price]) //* 100 + "%"
            row.appendChild(priceObj)
        }

    }
}

function hexColorFromPercent(i){
    console.log(i)
    if(i <= 0){
        return colorToHex(80, 0, 0)
    }
    else if(i <= 0.5 && i > 0){
        return colorToHex((255-80)/0.5  * i + 80, 00, 00)
    }
    else if(i <= 1 && i > 0.5){
        return colorToHex(255, 510*(i-0.5), 510*(i-0.5))
    }
    else if(i <= 4 && i > 1){
        return colorToHex((-255/3)*(i-1) + 255 , 255 , (-255/3)*(i-1) + 255 )
    }
    else if(i <= 11 && i > 4){
        return colorToHex(0, (80-255)/7 * (i-4) + 255, 0)
    }
    else if(i > 11){
        return colorToHex(0, 80, 0)
    }
}

function colorToHex(r,g,b){
    return '5px solid rgb('+Math.round(r)+","+Math.round(g)+","+Math.round(b)+")"
}

function lossPercentToColorCode(i){
    if(i <= 0){
        return 0
    }
    if(i > 0 && i <= 3){
        return Math.ceil(i*10)/10
    }
    if(i > 3 && i <= 11){
        return Math.ceil(i)
    }
    if(i > 11){
        return 11
    }
}

