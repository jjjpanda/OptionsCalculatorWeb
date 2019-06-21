function delta(t, priceUnderlying, strike, isCall, isLong, r, divYield, iv){
    if(isCall){
        return (isLong ? 1 : -1) * Math.exp(-1 * divYield * t) * cndf(d1(priceUnderlying, strike, t, divYield, r, iv));
    }
    else if(!isCall){
        return (isLong ? 1 : -1) * Math.exp(-1 * divYield * t) * (cndf(d1(priceUnderlying, strike, t, divYield, r, iv)) - 1);
    }
}

function gamma(t, priceUnderlying, strike, isLong, r, divYield, iv){
    return (isLong ? 1 : -1) * Math.exp(-1 * divYield * t) * ndf(d1(priceUnderlying, strike, t, divYield, r, iv)) / (priceUnderlying * iv * Math.sqrt(t));
}

function theta(t, priceUnderlying, strike, isCall, isLong, r, divYield, iv){
    if(isCall){
        return (isLong ? 1 : -1) * (-(ndf(d1(priceUnderlying, strike, t, divYield, r, iv)) / (2 * Math.sqrt(t)) * priceUnderlying * iv * Math.exp(-1 * divYield * t)) +
        (divYield * priceUnderlying * Math.exp(-1 * divYield * t) * cndf(d1(priceUnderlying, strike, t, divYield, r, iv))) -
        (r * strike * Math.exp(-1 * r * t) * ndf(d2(priceUnderlying, strike, t, divYield, r, iv)))
        ) / 365;
    }
    else if(!isCall){
        return (isLong ? 1 : -1) * (-(ndf(d1(priceUnderlying, strike, t, divYield, r, iv)) / (2 * Math.sqrt(t)) * priceUnderlying * iv * Math.exp(-1 * divYield * t)) -
        (divYield * priceUnderlying * Math.exp(-1 * divYield * t) * cndf(-1 * d1(priceUnderlying, strike, t, divYield, r, iv))) -
        (r * strike * Math.exp(-1 * r * t) * ndf(-1 * d2(priceUnderlying, strike, t, divYield, r, iv)))
        ) / 365;
    }
}

function vega(t, priceUnderlying, strike, isLong, r, divYield, iv){
    return (isLong ? 1 : -1) * priceUnderlying / 100 * Math.exp(-1 * divYield * t) * Math.sqrt(t) * ndf(d1(priceUnderlying, strike, t, divYield, r, iv));
}

function rho(t, priceUnderlying, strike, isCall, isLong, r, divYield, iv){
    if(isCall){
        return (isLong ? 1 : -1) * t / 100 * Math.exp(-1 * r * t) * strike * cndf(d2(priceUnderlying, strike, t, divYield, r, iv));                    
    }
    else if(!isCall){
        return (isLong ? 1 : -1) * t / -100 * Math.exp(-1 * r * t) * strike * cndf(-1 * d2(priceUnderlying, strike, t, divYield, r, iv));     
    }
}