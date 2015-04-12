/*jshint node: true*/
'use strict';

var express = require("express");
var bodyParser = require('body-parser');
var google_places = require('googleplaces');

var app = express();
var port = process.env.PORT || 3700;  // Change this later FIXME

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

// images
app.use(express.static(__dirname + '/../client/img'));

app.get('/', function(req, res){
  res.render('index');
});

// API for getting possibilities:
//    + lat
//    + long
//    + limit
//    + category
//    + distance (set it to default value)
//      shuffle the returned values

process.env.GOOGLE_PLACES_API_KEY = "AIzaSyDP9pkfwEz2tMQbvnyz8ugNNl2jfCznIRs";

process.env.GOOGLE_PLACES_OUTPUT_FORMAT = "json";

//console.log('API KEY:', process.env.GOOGLE_PLACES_API_KEY);
//console.log('Output format:', process.env.GOOGLE_PLACES_OUTPUT_FORMAT);

var googlePlaces = new google_places(process.env.GOOGLE_PLACES_API_KEY, process.env.GOOGLE_PLACES_OUTPUT_FORMAT);
var parameters;

// TODO

app.get('/places', function (req, res){
  console.log('ll: ',req.query.lat);   
  parameters = {
      location:[req.query.lat, req.query.lng],
      types:req.query.cat,
      radius:req.query.dist
  };    

  googlePlaces.placeSearch(parameters, function (error, response) {
      if (error) throw error;
      //console.log(response.results);
      
      console.log('response is', response.results[0]);
      // populate the response object for get
      //res.json(response.results);  
      res.send(JSON.stringify(response.results));  

  });


});

app.listen(port);
console.log('App running on port', port);
