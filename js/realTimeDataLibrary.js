const request = require('request');

function getData(apikey, ticker){
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
        //console.log(response.statusCode);
        console.log(body);
    });
}

function getExpiries(apikey, ticker){
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
        //console.log(response.statusCode);
        console.log(body);
      });
}

function getChain(apikey, ticker, expiration){
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
        console.log(body);
      });
}
