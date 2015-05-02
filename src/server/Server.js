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
    cookieParser = require('cookie-parser'),
    session = require('express-session'),

    // Requestors
    GoogleRequestor = require('./GoogleRequestor'),
    TestRequestor = require('./TestRequestor'),

    // database
    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,

    // controllers
    UserController = require('./controller/UserController'),

    // authentication
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    hostname = process.env.HOST || 'localhost',

    R = require('ramda'),
    shuffle = require('lodash.shuffle');

var Server = function(opts) {
    this._cache = {};

    // Set up the requestor
    this.requestor = null;
    this.initializeRequestor(opts);

    this._port = opts.port;
    this._app = express();

    // TODO Add models
    this.mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/decision';
    this.models = {
        user: null
    };

    this.configureModels(function() {
        // Configure Controllers
        this.controllers = {
            user: new UserController(this.models.user)
        };

        // Configure authentication
        this.configureAuthentication();

        // Configure app
        this.initializeApp(opts);
        this.configureRoutes();

        // If the server has already been started
        if (this.onStart !== null) {
            //this.start(this.onStart);
        }
    }.bind(this));
};

/**
 * Initialize database models
 *
 * @param {Function} callback
 * @return {undefined}
 */
Server.prototype.configureModels = function(callback) {
    MongoClient.connect(this.mongoURI, function(err, db) {
        if (err) {
            throw new Error(err);
        }
        this.models.user = db.collection('users');
        console.log('Connected to database at', this.mongoURI.split('@').pop());

        callback();
    }.bind(this));
};

Server.prototype.configureAuthentication = function() {
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });
    passport.deserializeUser(function(id, done) {
        this.models.user.findOne({_id: ObjectID(id)}, function(err, user) {
            done(err, user);
        });
    }.bind(this));

    // Facebook
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: 'http://'+hostname+'/auth/facebook/return',
        passReqToCallback: true
    }, this.findOrCreateFacebookUser.bind(this)));

};

Server.prototype.findOrCreateFacebookUser = function(token, accessToken, refreshToken, profile, done) {
    // Find the user or create the user
    // Check vars
    console.log('profile is:', Object.keys(profile));

    this.models.user.findOne({accountId: profile.id,
                              accountType: 'Facebook'}, /*{limit: 1},*/ function(err, user) {
        if (!user) {
            this.models.user.insert({accountId: profile.id,
                                     accountType: 'Facebook',
                                     email: profile.emails[0].value},  // First email
                                     function(err, res) {
                done(err, res[0]);
            }.bind(this));
        } else {
            done(err, user);
        }
    }.bind(this));
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

    this._app.use(bodyParser.json({extended: true}));
    this._app.use(bodyParser.urlencoded({extended: true}));
    this._app.use(cookieParser());
    this._app.use(session({resave: false, 
                          saveUninitialized: false,
                          secret: 'somerandasdfodsecret'}));
    this._app.use(passport.initialize());
    this._app.use(passport.session());

    // styles
    this._app.use(express.static(__dirname + '/../client/css'));

    // scripts
    this._app.use(express.static(__dirname + '/../client/js'));

    // images
    this._app.use(express.static(__dirname + '/../client/img'));
};

Server.prototype.configureRoutes = function() {
    this._app.get('/', function(req, res){
        res.render('index');
    });

    this._app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
    this._app.get('/auth/facebook/return', 
        // FIXME
        passport.authenticate('facebook', {successRedirect: '/dashboard',
                                           failureRedirect: '/'})
    );

    this._app.get('/places', function (req, res) {
        var num = req.query.num;

        var parameters = {
            location:[req.query.lat, req.query.lng],
            types:req.query.cat,
            radius:req.query.dist
        };    

        this.getPlaces(parameters, function(results) {
            num = Math.min(results.length,num);
            results = shuffle(results);
            results = results.splice(0,num);
            res.send(JSON.stringify(results));  
        });

    }.bind(this));
};

// Caching
var initIfNeeded = function(obj, key) {
    if (obj[key] === undefined) {
        obj[key] = {};
    }
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
    var fields = ['name', 'icon', 'rating', 'vicinity', 'opening_hours', 'price_level'];
    return R.pick(fields, result);
};

Server.prototype.start = function(callback) {
    callback = callback || function(){};
    this._app.listen(this._port, callback);
    console.log('App running on port', this._port);
};

module.exports = Server;
