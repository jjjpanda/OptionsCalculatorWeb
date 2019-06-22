function getOptionsData(arrayOfOptions, callback){
    arrayOfRows = $(".bottomRow")
    for(i = 0; i < arrayOfRows.length; i++){
        arrayOfOptions[i].boughtAt = arrayOfRows[i].children[5].value
        arrayOfOptions[i].isLong = arrayOfRows[i].children[0].children[0].checked
        arrayOfOptions[i].quantity = arrayOfRows[i].children[3].value
    }
    calculatedOptionsData = calculate(arrayOfOptions)
    mergedData =  getTotalsOfOptions(calculatedOptionsData)
    callback(calculatedOptionsData, mergedData)
}

function getTotalsOfOptions(options){
    mergedData = {'boughtAt':0, 'expiry':"", 'greeks':{'delta':0, 'gamma':0, 'theta':0, 'vega':0, 'rho':0}, 'profit':{}}
    for (option of options){
        mergedData.boughtAt += (option.isLong ? 1 : -1) * option.boughtAt * option.quantity

        mergedData.greeks.delta += option.greeks.delta * option.quantity
        mergedData.greeks.gamma += option.greeks.gamma * option.quantity
        mergedData.greeks.theta += option.greeks.theta * option.quantity
        mergedData.greeks.vega += option.greeks.vega * option.quantity
        mergedData.greeks.rho += option.greeks.rho * option.quantity

    }
    
    optionsProfits = Object.create(options.map(o => o.profit))
    mergedData.profit = optionsProfits.reduce(reduceObject);    
    return mergedData
}

var reduceObject = (a,b) => {
    for (prop in b){
        if(a.hasOwnProperty(prop)){
            if(a[prop] instanceof Object || b[prop] instanceof Object){
                a[prop] = [a[prop], b[prop]].reduce(reduceObject);
            }
            else{
                a[prop] = (a[prop] || 0) + (b[prop] || 0)
            }
        }
    }
    return a;
}

function calculate(options){
    //boughtAt, expiry, isLong, price, quantity, strike, type
    for(option of options){
        Object.keys(option).forEach(function(e){
            if(e != 'expiry' && !isNaN(parseFloat(option[e]))){
                option[e] = parseFloat(option[e])
            }
        })
        option.iv = calculateIV(timeTillExpiry(expiryConvertToDate(option.expiry)), option.price, stockdata.price, option.strike, option.type == 'Call', 0, 0)
        option.greeks = calculateGreeks(timeTillExpiry(expiryConvertToDate(option.expiry)), stockdata.price, option.strike, option.type === "Call", option.isLong, 0, 0, option.iv)
        //option.profit = calculateProfit(stockdata.price*0.9 , stockdata.price*1.1 , stockdata.price*0.01, option.boughtAt, option.quantity, option.expiry, option.strike, option.type === "Call", option.isLong, 0,0,option.iv)
        option.profit = calculateProfit(stockdata.price-1 , stockdata.price+1 , 0.5, option.boughtAt, option.quantity, option.expiry, option.strike, option.type === "Call", option.isLong, 0,0,option.iv)

        jsonContainer = document.createElement('pre')
        jsonContainer.innerText = expiryToString(option.expiry) + " $" + option.strike + " " + option.type + "\n" + JSON.stringify(option.profit, undefined, 2)
        $('#jsonOutput')[0].appendChild(jsonContainer)
    }
    return options
}

function calculateProfit(minPrice, maxPrice, interval, initialCost, quantity, expiry, strike, isCall, isLong, r, divYield, iv){
    profitJSON = {}

    var rangeOfPrices = {}

    //EACH UNDERLYING IN RANGE
    for(i = minPrice; i < maxPrice; i+=interval){
        rangeOfPrices[i] = isLong ? -1*initialCost : 1*initialCost
    }

    //PROFIT BEFORE EXPIRY
    d = getCurrentDate()
    while(timeBetweenDates(expiryConvertToDate(expiry), d) > 0){
        profitJSON[d] = {...rangeOfPrices};
        for(price of Object.keys(rangeOfPrices)){
            profitJSON[d][price] += calculateOptionsPrice(percentageOfYear(timeBetweenDates(expiryConvertToDate(expiry), d)), price, strike, isCall, isLong, r, divYield, iv)
            profitJSON[d][price] *= quantity
        }
        d = incrementOneDay(d)
    }
    
    //PROFIT AT EXPIRY
    profitJSON[d] = {};
    for(price of Object.keys(rangeOfPrices)){    
        profitJSON[d][price] = quantity * calculateProfitAtExpiry(initialCost, price, strike, isCall, isLong)
    }

    return profitJSON
}

function calculateGreeks(t, priceUnderlying, strike, isCall, isLong, r, divYield, iv){
    greeks = {}
    greeks.delta = delta(t, priceUnderlying, strike, isCall, isLong, r, divYield, iv)
    greeks.gamma = gamma(t, priceUnderlying, strike, isLong, r, divYield, iv)
    greeks.theta = theta(t, priceUnderlying, strike, isCall, isLong, r, divYield, iv)
    greeks.vega = vega(t, priceUnderlying, strike, isLong, r, divYield, iv)
    greeks.rho = rho(t, priceUnderlying, strike, isCall, isLong, r, divYield, iv)
    return greeks
}

function calculateIV(t, priceOfOption, priceUnderlying, strike, isCall, r, divYield){
    var iv = Math.sqrt(Math.PI * 2 / t) * priceOfOption/priceUnderlying
    var priceOfOptionTheoretical, vega;
    priceOfOptionTheoretical = calculateOptionsPrice(t, priceUnderlying, strike, isCall, true,  r, divYield, iv)
    while (loss(priceOfOption, priceOfOptionTheoretical) > 0.000005 || loss(priceOfOption, priceOfOptionTheoretical) < -0.000005){
        if(loss(priceOfOption, priceOfOptionTheoretical) > priceOfOption / 10){
            if (priceOfOption > priceOfOptionTheoretical)
            {
                iv += 0.075 + Math.random()/15;
            }
            if (priceOfOption < priceOfOptionTheoretical)
            {
                iv -= 0.075 + Math.random()/15;
            }
        }
        else{
            vega = priceUnderlying * Math.exp(-1 * divYield * t) * Math.sqrt(t) * ndf(d1(priceUnderlying, strike, t, divYield, r, iv))
            iv = iv + (loss(priceOfOption, priceOfOptionTheoretical) / vega)
        }
        priceOfOptionTheoretical = calculateOptionsPrice(t, priceUnderlying, strike, isCall, true, r, divYield, iv)
    }
    if (iv < 0){
        return -1 //INVALID ID
    }
    return iv
}

function calculateOptionsPrice(t, priceUnderlying, strike, isCall, isLong, r, divYield, iv){
    var priceOfOptionTheoretical
    if(isCall){
        priceOfOptionTheoretical = priceUnderlying * Math.exp(-1* divYield* t) * cndf(d1(priceUnderlying, strike, t, divYield, r, iv)) - strike * Math.exp(-1 * r * t) * cndf(d2(priceUnderlying, strike, t, divYield, r, iv))
    }
    else if(!isCall){
        priceOfOptionTheoretical = -1 * priceUnderlying * Math.exp(-1* divYield* t) * cndf(-1 * d1(priceUnderlying, strike, t, divYield, r, iv)) + strike * Math.exp(-1 * r * t) * cndf(-1 * d2(priceUnderlying, strike, t, divYield, r, iv))
    }
    if(!isLong){
        priceOfOptionTheoretical *= -1
    }
    return priceOfOptionTheoretical
}

function calculateProfitAtExpiry(initialCost, priceUnderlying, strike, isCall, isLong){
    if (isCall)
    {
        if (isLong)
        {
            return Math.max(((-1 * initialCost) + (priceUnderlying - strike)), (-1 * initialCost));
        }
        else if (!isLong)
        {
            return Math.min((initialCost - (priceUnderlying - strike)), initialCost);                             
        }
    }
    else if (!isCall)
    {
        if (isLong)
        { 
            return Math.max(((-1 * initialCost) + (-1 * priceUnderlying + strike)), (-1 * initialCost));
        }
        else if (!isLong)
        {
            return Math.min((initialCost - (-1 * priceUnderlying + strike)), initialCost);
        }
    }
}