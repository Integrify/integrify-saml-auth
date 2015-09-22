var express = require('express');
var subApp = require("./route-multi.js")
var app = express();

app.use("/",subApp.router)

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});