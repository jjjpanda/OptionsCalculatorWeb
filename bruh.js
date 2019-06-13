var apikey = '4eCmLRuRbcg8iz1lGYNdbUDXuo8X'
const request = require('request');
var ticker = '2543625756'
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
        //console.log(response.statusCode)
        if(!error && response.statusCode == 200){
            console.log(body); 
            console.log(response.statusCode)
        }
        else{
            console.log({"error": "error"})
        }
       
    });