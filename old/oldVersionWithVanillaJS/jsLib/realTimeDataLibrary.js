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
            if(body != null && 'quote' in body){
                price = body.quote.last
                change = body.quote.change_percentage
                body = {'price':price, 'change':change}
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
            body = JSON.parse(body).expirations
            if(body != null && body.date != undefined){
                body = body.date;
                bodyLen = body.length;
                var fullChain = {}
                index = 0;
                function clback(data){
                    fullChain[body[index]] = data;
                    index++;
                    if(index >= bodyLen){   // 1 works but not any more than 1
                        callback(fullChain)
                    }
                    else{
                        module.exports.getChain(apikey, ticker, body, index, clback)
                    }
                }
                
                module.exports.getChain(apikey, ticker, body, index, clback)
            }
            else{
                callback(null); 
            }
        }
        else{
            callback({'error':error, 'response':response.statusCode});
        }
      });
},

getChain: function (apikey, ticker, expiration, index, callback){
    request({
        method: 'get',
        url: 'https://sandbox.tradier.com/v1/markets/options/chains',
        qs: {
        'symbol': ticker,
        'expiration': expiration[index]
        },
        headers: {
        'Authorization': 'Bearer '+apikey,
        'Accept': 'application/json'
        }
        }, (error, response, body) => {
        //console.log(response.statusCode);
        if(!error && response.statusCode == 200){
            body = JSON.parse(body).options
            if(body.option != undefined){
                body = body.option;
                bid = body.map(a => a.bid)
                ask = body.map(a => a.ask)
                strike = body.map(a => a.strike)
                type = body.map(a => a.option_type)
                data = zip([type, strike, bid, ask]) 
            }
            data = data.map(function(x){
                return {
                    type: x[0],
                    strike: x[1],
                    bid: x[2],
                    ask: x[3]
                };
            });
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