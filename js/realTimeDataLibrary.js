const request = require('request');

module.exports = {
getData: function (apikey, ticker, callback){
    request({
        method: 'get',
        url: 'https://sandbox.tradier.com/v1/markets/quotes',
        qs: {
        'symbols': ticker      
        },
        headers: {
        'Authorization': 'Bearer '+ apikey,
        'Accept': 'application/json'
        }
        }, (error, response, body) => {
        if(!error && response.statusCode == 200){
            body = JSON.parse(body).quotes
            if(body.quote != undefined){
                body = body.quote.last
            }
            if(body === undefined){
                body = null
            }
            callback(body); 
        }
        else{
            callback({'error':error, 'response':response.statusCode});
        }
    });
},

getExpiries: function (apikey, ticker, callback){
    request({
        method: 'get',
        url: 'https://sandbox.tradier.com/v1/markets/options/expirations',
        qs: {
        'symbol': ticker,
        'includeAllRoots': 'true',
        'strikes': 'false'
        },
        headers: {
        'Authorization': 'Bearer '+apikey,
        'Accept': 'application/json'
        }
        }, (error, response, body) => {
        if(!error && response.statusCode == 200){
            body = body.expirations
            if(body.date != undefined){
                body = body.date;
                var fullChain = {}
                for(date of body){
                    this.getChain(apikey, ticker, date, function(data){
                        fullChain[date] = data
                    })
                }
            }
            callback(fullChain); 
        }
        else{
            callback({'error':error, 'response':response.statusCode});
        }
      });
},

getChain: function (apikey, ticker, expiration, callback){
    request({
        method: 'get',
        url: 'https://sandbox.tradier.com/v1/markets/options/chains',
        qs: {
        'symbol': ticker,
        'expiration': expiration
        },
        headers: {
        'Authorization': 'Bearer '+apikey,
        'Accept': 'application/json'
        }
        }, (error, response, body) => {
        //console.log(response.statusCode);
        if(!error && response.statusCode == 200){
            body = body.options
            if(body.option != undefined){
                body = body.option;
                bid = body.map(a => a.bid)
                ask = body.map(a => a.ask)
                strike = body.map(a => a.strike)
                type = body.map(a => a.option_type)
                data = zip([type, strike, bid, ask]) 
            }
            callback(data); 
        }
        else{
            callback({'error':error, 'response':response.statusCode});
        }
      });
}
};

function zip(arrays) {
    return Array.apply(null,Array(arrays[0].length)).map(function(_,i){
        return arrays.map(function(array){return array[i]})
    });
}