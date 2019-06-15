const http = require('http');

const exp = require('express');
const bodyParser = require("body-parser")

const path = require('path')

const realTimeOptions = require('./js/realTimeDataLibrary.js')

const app = exp()

const port = process.env.PORT;
const key = process.env.tradier;

app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

app.use('/js', exp.static(path.join(__dirname, '/js')));
app.use('/jsLib', exp.static(path.join(__dirname, '/jsLib')));
app.use('/css', exp.static(path.join(__dirname, '/css')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')))

app.post('/price', function(req, res){
    var ticker = req.body.ticker
    //res.json({"test": "test"});
    realTimeOptions.getData(key, ticker, function(data){
        res.json(data);
    });
})

app.post('/chain', function(req, res){
    var ticker = req.body.ticker
    realTimeOptions.getExpiries(key, ticker, function(data){
        res.json(data);
    });
})


app.listen(port, () => console.log("Server running at http://localhost:%d", port));




