const http = require('http');
const exp = require('express');
const app = exp()
const port = process.env.PORT || 1337;

app.get('/', (req, res) => res.sendFile('index.html'))
app.listen(port, () => console.log("Server running at http://localhost:%d", port));




