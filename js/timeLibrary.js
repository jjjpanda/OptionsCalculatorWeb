const ms_per_day = 1000*60*60*24
var current
function getCurrentDate(){
    current = new Date()
}

function timeTillExpiry(expiry){
    const utc1 = Date.UTC(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
    const utc2 = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate());
    return Math.floor((utc1-utc2)/ ms_per_day)
}

function expiryConvertToDate(strDate){
    strDate = strDate.split("-")
    return new Date(strDate[0], (strDate[1]+1), strDate[2])
}