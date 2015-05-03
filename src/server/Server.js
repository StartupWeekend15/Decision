/*jshint node: true*/
'use strict';
// API for getting possibilities:
//    @param {Number} lat
//    @param {Number} lng
//    @param {Number} num (limit)
//    @param {Array<String>} category
//    @param {Number} distance (set it to default value)


var express = require("express"),
    bodyParser = require('body-parser'),
    GoogleRequestor = require('./GoogleRequestor'),
    TestRequestor = require('./TestRequestor'),
    R = require('ramda'),
    shuffle = require('lodash.shuffle'),
    array = require('array-extended');

var Server = function(opts) {
    this._cache = {};

    // Set up the requestor
    this.requestor = null;
    this.initializeRequestor(opts);

    this._port = opts.port;
    this._app = express();
    this.initializeApp(opts);
};

/**
 * Configure a requestor for the server.
 *
 * @param {Object} opts
 * @return {undefined}
 */
Server.prototype.initializeRequestor = function(opts) {
    if (opts.requestor === 'Test') {
        this.requestor = new TestRequestor();
    } else {
        this.requestor = new GoogleRequestor(opts);
    }
};

Server.prototype.initializeApp = function() {
    // setting the view stuff
    this._app.set('views', __dirname+'/../client');
    this._app.set('view engine', "jade");
    this._app.use(express.static(__dirname + '/../client'));
    this._app.engine('jade', require('jade').__express);
    this._app.use(bodyParser.urlencoded({extended: true}));

    // styles
    this._app.use(express.static(__dirname + '/../client/css'));

    // scripts
    this._app.use(express.static(__dirname + '/../client/js'));

    // images
    this._app.use(express.static(__dirname + '/../client/img'));

    this._app.get('/', function(req, res){
        res.render('index');
    });

    this._app.get('/places', function (req, res) {
        var num = req.query.num;
        var cats = this.splitCats(req.query.cat.toString());
        console.log("The catagories received: ",cats);
        var parameters = {
            location:[req.query.lat, req.query.lng],
            types:req.query.cat.toString().replace(/;/g,',').split(','),
            radius:req.query.dist
        };    

        console.log('params:', parameters);
        this.getPlaces(parameters, function(results) {

            num = Math.min(results.length,num);
            results = shuffle(results);
            results = this.splitPlaces(results,cats,num);
            //results = [];
            res.send(JSON.stringify(results));  
        }.bind(this));

    }.bind(this));

};

// Caching
var initIfNeeded = function(obj, key) {
    if (obj[key] === undefined) {
        obj[key] = {};
    }
};


Server.prototype.splitCats = function(cats){
    var res = cats.split(',');
    //console.log("The split categories: ",res);
    var cat =  res.map(function(item){
        return item.replace(/;/g,',');
    });
    //console.log("Categories: ",cat); 
    return cat; 
};


Server.prototype.splitPlaces = function(results,cats,num){
    var res = {};

    for(var i=0; i<cats.length;++i){
        var tmp = [];
        for(var j=0; j<results.length; ++j){
            var temp = cats[i].split(',');
            // If length of intersections is non-zero, throw them in
            var intersect = array.intersect(results[j].types,temp);
            if(intersect.length>0){
                tmp.push(results[j]);
            }
        }
        tmp = tmp.splice(0,num);

        console.log('CATS:', cats[i]);
        console.log("Array size: ",tmp.length);
        // Add it to a map
        res[cats[i]] = tmp;
    }  

    console.log('RESPONSE:', res);

    // results = results.splice(0,num);
    return res;
};

Server.prototype.getPlacesFromCache = function(params, callback) {
    var loc = params.location.join(','),
        types = params.types.join(','),
        radius = params.radius;

    initIfNeeded(this._cache, loc);
    initIfNeeded(this._cache[loc], types);
    if (this._cache[loc][types][radius]) {
        callback(this._cache[loc][types][radius].slice());
    } else {
        callback(null);
    }
};

Server.prototype.cachePlaces = function(params, value) {
    var loc = params.location,
        types = params.types.join(','),
        radius = params.radius;

    this._cache[loc][types][radius] = value.slice();
};

Server.prototype.getPlaces = function(params, callback) {
    this.getPlacesFromCache(params, function(cachedValue) {
        if (cachedValue) {
            callback(cachedValue.slice());
        } else {
          this.requestor.request(params, function (error, response) {
              if (error) {
                  throw error;
              }

              var results = response.results.map(this.convertResult);

              this.cachePlaces(params, results);
              callback(results);
          }.bind(this));
        }
    }.bind(this));
};

/**
 * Convert a single request
 *
 * @param result
 * @return {undefined}
 */
Server.prototype.convertResult = function(result) {
    var fields = ['name', 'icon', 'rating', 'vicinity', 'opening_hours', 'price_level', 'types'];
    return R.pick(fields, result);
};

Server.prototype.start = function(callback) {
    callback = callback || function(){};
    this._app.listen(this._port, callback);
    console.log('App running on port', this._port);
};

module.exports = Server;
