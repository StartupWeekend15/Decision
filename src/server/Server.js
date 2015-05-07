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

    Requestors = require('./requestors'),
    R = require('ramda'),
    path = require('path'),
    _ = require('lodash'),
    async = require('async'),
    Utils = require('./Utils'),
    array = require('array-extended');

var Server = function(opts) {
    this._cache = {};

    // Set up the requestor
    this._requestors = null;

    this.initializeRequestors(opts);

    this._port = opts.port;
    this._app = express();
    this.initializeApp(opts);
};

/**
 * Initialize the requestors used by the server.
 *
 * @param {Object} opts
 * @return {undefined}
 */
Server.prototype.initializeRequestors = function(opts) {
    this._requestors = Requestors.map(function(Req) {
        return new Req(opts);
    });
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

    // bower_components
    this._app.use('/bower_components',  express.static(__dirname + '/../../bower_components'));

    this._app.get('/', function(req, res){
        res.render('index');
    });

    this._app.get('/places', function (req, res) {
        var num = req.query.num;
        var cats = this.splitCats(req.query.cat.toString());
        console.log("<<<< Categories received: ",cats);
        var parameters = {
            location:[req.query.lat, req.query.lng],
            // Group all requested categories
            types:req.query.cat.toString().replace(/;/g,',').split(','),
            radius:req.query.dist
        };    

        // Send the messages to every requestor that needs it
        async.map(this._requestors, this._request.bind(this,parameters), function(err, results) {
            if (err) {
                return console.error('Could not get requests:', err);
            }
            // Merge all results and remove "null" values
            results = R.reject(R.isNil, R.flatten(results));

            // Group by requested categories
            var response = {};
            cats.forEach(function(c) {
                response[c] = results.filter(Utils.hasCategory.bind(null, c.split(',')));
            }, this);

            console.log('<<< Final Response is', response.movies);

            return res.send(JSON.stringify(response));  
        });

    }.bind(this));

};

Server.prototype._request = function(req, requestor, callback) {
    if (_.intersection(req.types, requestor.getCategories()).length) {
        requestor.request(req, function(err, results) {
            console.log('<<< Results from '+requestor.getName()+':', results);
            return callback(err, results);
        });
    } else {
        return callback(null, null);
    }
};

// Caching
var initIfNeeded = function(obj, key) {
    if (obj[key] === undefined) {
        obj[key] = {};
    }
};

Server.prototype.splitCats = function(cats){
    var res = cats.split(',');
    var cat =  res.map(function(item){
        return item.replace(/;/g,',');
    });
    return cat; 
};


Server.prototype.splitPlaces = function(results,cats,num){
    var res = {};

    for(var i=0; i<cats.length; ++i){
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

        // Add it to a map
        res[cats[i]] = tmp;
    }  

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

Server.prototype.getPlaces = function(params, callback) {
    this.getPlacesFromCache(params, function(cachedValue) {
        if (cachedValue) {
            callback(cachedValue.slice());
        } else {
            // FIXME: Add support for getting different results
          this.requestor.request(params, function (error, results) {
              if (error) {
                  throw error;
              }

              this.cachePlaces(params, results);
              callback(results);
          }.bind(this));
        }
    }.bind(this));
};

Server.prototype.start = function(callback) {
    callback = callback || function(){};
    this._app.listen(this._port, callback);
    console.log('App running on port', this._port);
};

module.exports = Server;
