const ms_per_day = 1000*60*60*24
var lastLoad;

function getCurrentDate(){
    return new Date()
}

function timeBetweenDates(a, b){
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return (Math.floor((utc1-utc2)/ ms_per_day))
}

function percentageOfYear(t){
    return t/365.0  //returned as percentage of year
}

function timeTillExpiry(expiry){
    var current = getCurrentDate()
    return percentageOfYear(timeBetweenDates(expiry, current)) 
}

function incrementOneDay(d){
    d.setDate(d.getDate()+1)
    return d
}

function dateToString(d){
    return(d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate())
}

function expiryConvertToDate(strDate){
    strDate = strDate.split("-")
    return new Date(strDate[0], (strDate[1]-1), strDate[2])
}

function expiryToString(strDate){
    strDate = strDate.split("-")
    return strDate[1]+"/"+strDate[2]+"/"+strDate[0]
}

function minutesSinceLastLoad(){
    return (new Date() - lastLoad) / (1000*60)
  }