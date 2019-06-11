const http = require('http');
const exp = require('express');
const path = require('path')
const app = exp()
const port = process.env.PORT || 1337;

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')))
app.listen(port, () => console.log("Server running at http://localhost:%d", port));




