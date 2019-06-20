$(document).ready(function(){
    $("#calculateOptions").click(function(){
        loadIconStart()
        getOptionsData(optionsSelected, function(){
            loadIconStop()
        })
    });
});

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
        option.iv = calculateIV(timeTillExpiry(expiryConvertToDate(option.expiry)), option.price, stockdata.price, option.strike, option.type == 'Call', 0, 0)
        option = {...option, ...calculateGreeks(timeTillExpiry(expiryConvertToDate(option.expiry)), stockdata.price, option.strike, option.type === "Call", option.isLong, 0, 0, option.iv)}
        console.log(option)
        calculateProfit(0,20, 1, option.boughtAt, expiry, stockdata.price, option.strike, option.type === "Call", option.isLong, 0,0,option.iv)
    }
    
}

function calculateProfit(minPrice, maxPrice, interval, initialCost, expiry, priceUnderlying, strike, isCall, isLong, r, divYield, iv){
    profitJSON = []

    var rangeOfPrices = {}
    for(i = minPrice; i < maxPrice; i+=interval){
        rangeOfPrices[i] = initialCost
    }

    console.log(rangeOfPrices)
    
    d = getCurrentDate()
    while(timeBetweenDates(expiryConvertToDate(expiry), d) > 0){
        profitJSON.push( {[d] : {...rangeOfPrices}} );
        d = incrementOneDay(d)
    }

    console.log(profitJSON)
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
    priceOfOptionTheoretical = calculateOptionsPrice(t, priceUnderlying, strike, isCall, r, divYield, iv)
    while (loss(priceOfOption, priceOfOptionTheoretical) > 0.00001 || loss(priceOfOption, priceOfOptionTheoretical) < -0.00001){
        if(loss(priceOfOption, priceOfOptionTheoretical) > priceOfOption / 10){
            if (priceOfOption > priceOfOptionTheoretical)
            {
                iv += 0.075 + Math.random()/20;
            }
            if (priceOfOption < priceOfOptionTheoretical)
            {
                iv -= 0.075 + Math.random()/20;
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
