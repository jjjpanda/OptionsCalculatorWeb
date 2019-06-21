function getOptionsData(arrayOfOptions, callback){
    arrayOfRows = $(".bottomRow")
    for(i = 0; i < arrayOfRows.length; i++){
        arrayOfOptions[i].boughtAt = arrayOfRows[i].children[5].value
        arrayOfOptions[i].isLong = arrayOfRows[i].children[0].children[0].checked
        arrayOfOptions[i].quantity = arrayOfRows[i].children[3].value
    }
    calculate(arrayOfOptions)
    callback()
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
        option = {...option, ...calculateGreeks(timeTillExpiry(expiryConvertToDate(option.expiry)), stockdata.price, option.strike, option.type === "Call", option.isLong, 0, 0, option.iv)}
        console.log(option)
        option.profit = calculateProfit(stockdata.price*0.9 , stockdata.price*1.1 , stockdata.price*0.01, option.boughtAt, expiry, option.strike, option.type === "Call", option.isLong, 0,0,option.iv)
        console.log(option.profit)

        jsonContainer = document.createElement('pre')
        jsonContainer.innerText = expiryToString(option.expiry) + " $" + option.strike + " " + option.type + "\n" + JSON.stringify(option.profit, undefined, 2)
        $('#jsonOutput')[0].appendChild(jsonContainer)
    }
}

function calculateProfit(minPrice, maxPrice, interval, initialCost, expiry, strike, isCall, isLong, r, divYield, iv){
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
        }
        d = incrementOneDay(d)
    }
    
    //PROFIT AT EXPIRY
    profitJSON[d] = {};
    for(price of Object.keys(rangeOfPrices)){    
        profitJSON[d][price] = calculateProfitAtExpiry(initialCost, price, strike, isCall, isLong)
    }

    return profitJSON
}

function calculateGreeks(t, priceUnderlying, strike, isCall, isLong, r, divYield, iv){
    greeks = {}
    if(isCall){
        greeks.delta = Math.exp(-1 * divYield * t) * cndf(d1(priceUnderlying, strike, t, divYield, r, iv));
        greeks.gamma = Math.exp(-1 * divYield * t) * ndf(d1(priceUnderlying, strike, t, divYield, r, iv)) / (priceUnderlying * iv * Math.sqrt(t));
        greeks.theta = (-(ndf(d1(priceUnderlying, strike, t, divYield, r, iv)) / (2 * Math.sqrt(t)) * priceUnderlying * iv * Math.exp(-1 * divYield * t)) +
            (divYield * priceUnderlying * Math.exp(-1 * divYield * t) * cndf(d1(priceUnderlying, strike, t, divYield, r, iv))) -
            (r * strike * Math.exp(-1 * r * t) * ndf(d2(priceUnderlying, strike, t, divYield, r, iv)))
            ) / 365;
        greeks.vega = priceUnderlying / 100 * Math.exp(-1 * divYield * t) * Math.sqrt(t) * ndf(d1(priceUnderlying, strike, t, divYield, r, iv));
        greeks.rho = t / 100 * Math.exp(-1 * r * t) * strike * cndf(d2(priceUnderlying, strike, t, divYield, r, iv));                    
    }
    else if(!isCall){
        greeks.delta = Math.exp(-1 * divYield * t) * (cndf(d1(priceUnderlying, strike, t, divYield, r, iv)) - 1);
        greeks.gamma = Math.exp(-1 * divYield * t) * ndf(d1(priceUnderlying, strike, t, divYield, r, iv)) / (priceUnderlying * iv * Math.sqrt(t));
        greeks.theta = (-(ndf(d1(priceUnderlying, strike, t, divYield, r, iv)) / (2 * Math.sqrt(t)) * priceUnderlying * iv * Math.exp(-1 * divYield * t)) -
            (divYield * priceUnderlying * Math.exp(-1 * divYield * t) * cndf(-1 * d1(priceUnderlying, strike, t, divYield, r, iv))) -
            (r * strike * Math.exp(-1 * r * t) * ndf(-1 * d2(priceUnderlying, strike, t, divYield, r, iv)))
            ) / 365;
        greeks.vega = priceUnderlying / 100 * Math.exp(-1 * divYield * t) * Math.sqrt(t) * ndf(d1(priceUnderlying, strike, t, divYield, r, iv));
        greeks.rho = t / -100 * Math.exp(-1 * r * t) * strike * cndf(-1 * d2(priceUnderlying, strike, t, divYield, r, iv));     
    }
    if(!isLong){
        greeks.delta *= -1
        greeks.gamma *= -1
        greeks.theta *= -1
        greeks.vega *= -1
        greeks.rho *= -1
    }
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