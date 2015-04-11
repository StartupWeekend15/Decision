'use strict';

var express = require("express");
var bodyParser = require('body-parser');
var app = express();
var port = 3700;  // Change this later FIXME

// setting the view stuff
app.set('views', __dirname+'/../client');
app.set('view engine', "jade");
app.use(express.static(__dirname + '/../client'));
app.engine('jade', require('jade').__express);
app.use(bodyParser.urlencoded({extended: true}));

// styles
app.use(express.static(__dirname + '/../client/css'));

// scripts
app.use(express.static(__dirname + '/../client/js'));

app.get('/', function(req, res){
  res.render('index');
});

// API for getting possibilities:
//    + lat
//    + long
//    + limit
//    + category
// TODO
app.get('/places', function(req, res){
    // This is just for client testing. Please delete.
    res.json(['Hattie B', 'McDonalds']);
});

app.listen(port);
console.log('App running on port', port);
