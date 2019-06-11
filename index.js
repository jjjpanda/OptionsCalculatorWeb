const http = require('http');
const exp = require('express');
const app = exp()
const port = process.env.PORT || 1337;

const server = http.createServer(function(request, response) {

    fs.readFile("index.html", function(err, data){
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);SR
        response.end();
    });

}).listen(port);

app.get('/', (req, res) => res.sendFile('index.html'))
app.listen(port, () => console.log("Server running at http://localhost:%d", port));




