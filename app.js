const http = require('http');
const exp = require('express');
const bodyParser = require("body-parser")
const path = require('path')
const app = exp()
const port = process.env.PORT || 1337;
const key = process.env.tradier;(

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')))
app.post('/', function(req, res){
    var ticker = req.body.ticker
    res.send({"bruh": ticker})
})
app.listen(port, () => console.log("Server running at http://localhost:%d", port));




