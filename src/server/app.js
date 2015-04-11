'use strict';

var express = require("express");
var bodyParser = require('body-parser');
var app = express();
var port = 3700;  // Change this later FIXME

// setting the view stuff
app.set('views', __dirname+'/../client');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res){
    res.render('index');
});

app.listen(port);
console.log('App running on port', port);
