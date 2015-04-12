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
  var num = req.query.num;
  console.log('ll: ',req.query.lat);   
  parameters = {
      location:[req.query.lat, req.query.lng],
      types:req.query.cat,
      radius:req.query.dist
  };    

  googlePlaces.placeSearch(parameters, function (error, response) {
      if (error) throw error;
      //console.log(response.results);
     // var results = convert(response.results,num);
      //console.log('response is', response.results[0]);
      num = Math.min(response.results.length,num);
      var results = response.results.map(convertResult);
      results = results.splice(0,num);
      
      console.log('The places returned: ', results); 
      console.log('The length of places returned: ', results.length); 
      // populate the response object for get
      //res.json(response.results);  
      res.send(JSON.stringify(results));  

  });


});

/**
 * Convert a single request
 *
 * @param result
 * @return {undefined}
 */
function convertResult(result){
    var newRes = {};
    newRes.name = result.name;
    newRes.icon  = result.icon;
    newRes.rating = result.rating;
    newRes.vicinity = result.vicinity;
    newRes.opening_hours = result.opening_hours;
    newRes.price_level = result.price_level;
    return  newRes;
}

function convert(data,num){
    var res = [];
    for(var i=0; i<i<num;++i){
        res.push({"name": data[i].name,
                 "icon": data[i].icon,
                 "rating": data[i].rating,
        });
    }
}



app.listen(port);
console.log('App running on port', port);
