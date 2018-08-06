var express = require('express');
var subApp = require("./route.js")
var app = express();

app.use("/samlauth",subApp.router)

var server = app.listen(3001, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});