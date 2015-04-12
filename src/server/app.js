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

process.env.GOOGLE_PLACES_API_KEY = "AIzaSyDIw6RsLMhU2Z3WRNDpWlx3iOGJjfRFkj4";

process.env.GOOGLE_PLACES_OUTPUT_FORMAT = "json";

//console.log('API KEY:', process.env.GOOGLE_PLACES_API_KEY);
//console.log('Output format:', process.env.GOOGLE_PLACES_OUTPUT_FORMAT);

var googlePlaces = new google_places(process.env.GOOGLE_PLACES_API_KEY, process.env.GOOGLE_PLACES_OUTPUT_FORMAT);
var parameters;

// Caching
var initIfNeeded = function(obj, key) {
    if (obj[key] === undefined) {
        obj[key] = {};
    }
};
var cache = {};
var getPlaces = function(params, callback) {
    var loc = params.location.join(','),
        types = params.types.join(','),
        radius = params.radius;

    initIfNeeded(cache, loc);
    initIfNeeded(cache[loc], types);
    if (cache[loc][types][radius]) {
        console.log('Retrieving from cache', cache[loc][types][radius]); 
        callback(cache[loc][types][radius].slice());
    } else {
      googlePlaces.placeSearch(parameters, function (error, response) {
          if (error) {
              throw error;
          }

          var results = response.results.map(convertResult);
          
          console.log('Loading places', results); 
          cache[loc][types][radius] = results.slice();
          callback(results);
      });

    }
};

app.get('/places', function (req, res){
  var num = req.query.num;

  console.log('categories:', req.query.cat);
  parameters = {
      location:[req.query.lat, req.query.lng],
      types:req.query.cat,
      radius:req.query.dist
  };    

  getPlaces(parameters, function(results) {
      num = Math.min(results.length,num);
      results = results.splice(0,num);
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
    newRes.rating = result.rating; newRes.vicinity = result.vicinity;
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
