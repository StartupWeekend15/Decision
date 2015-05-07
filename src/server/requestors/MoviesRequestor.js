'use strict';
var FeedParser = require('feedparser'),
    DOMParser = require('xmldom').DOMParser, // jshint ignore:line
    request = require('request'),
    R = require('ramda'),
    movies = require('../../../test/assets/movieOptions'),
    Utils = require('../Utils');

var CATEGORIES = ['movies'];
/**
 * MoviesRequestor
 *
 * @constructor
 * @param {String} zip_code
 * @return {undefined}
 */
var MoviesRequestor = function(zip_code) {
    this._base_url = "http://www.fandango.com/rss/moviesnearme_";
    this._zip_code = zip_code;

    // If offline mode, get the movie options from /test/assets/movieOptoins
    if (process.env.NODE_ENV === 'offline') {
        this.request = this._offlineRequest.bind(this);
    }
};

MoviesRequestor.prototype.getName = function() {
    return 'MoviesRequestor';
};

/**
 * Request the given suggestions.
 *
 * @param {Function} done
 * @return {undefined}
 */
MoviesRequestor.prototype.request = function(req, done) {
    this._zip_code = Utils.latlng2zip.apply(null, req.location);
    this._fetchMovies(function(err, data) {
        if (err) {
            return done(err);
        }
        return done(null, this._formatResponse(data));
    }.bind(this));
};

/**
 * Get the supported categories of this requestor.
 *
 * @return {undefined}
 */
MoviesRequestor.prototype.getCategories = function() {
    return CATEGORIES.slice();
};

/**
 * Get the URL for requesting nearby movies
 *
 * @private
 * @return {undefined}
 */
MoviesRequestor.prototype._getUrl = function() {
    return this._base_url + this._zip_code + ".rss";
};

/**
 * Get rss file from Fandango.
 *
 * @private
 * @param {FeedParser} parser
 * @param {Function} done
 * @return {undefined}
 */
MoviesRequestor.prototype._getRssFile = function(parser,done) {
    var req = request(this._getUrl(), {timeout: 10000, pool:false});
    req.on('error',done);
    req.on('response', function(res){
        if (res.statusCode !== 200) {
            return this.emit('error', new Error('Bad status code'));
        }
        res.pipe(parser);
    });
};

/**
 * Create the list of movies info from the rss data.
 *
 * @private
 * @param data
 * @return {undefined}
 */
MoviesRequestor.prototype._createList = function(data) {
    var doc = new DOMParser().parseFromString(data,'text/xml'),
        ps = doc.getElementsByTagName('p'),
        address = ps[0].firstChild.data,
        m_list = doc.getElementsByTagName('li');

    var movie_list = [];
    for (var i = m_list.length - 1; i >= 0; i--) {
        var link = m_list[i].firstChild.getAttribute('href');
        var title = m_list[i].firstChild.firstChild.data;
        movie_list.push({'link':link, 'title': title});
    }
    return {'location': address, 'items': movie_list};
};

/**
 * Fetch the given movies from the database.
 *
 * @private
 * @param {Function} done
 * @return {undefined}
 */
MoviesRequestor.prototype._fetchMovies = function(done) {
    var theater_list = [];

    var feedparser = new FeedParser();

    feedparser.on('error',done);
    feedparser.on('end',function(){
        done(null, theater_list);
    });

    var self = this;
    feedparser.on('readable', function() {
        var stream = this, item;
        while (item = stream.read()) {  // jshint ignore:line
            var theater_info = self._createList(item.description);
            theater_info.name = item.title;
            theater_list.push(theater_info);
        }
    });

    this._getRssFile(feedparser, done);
};

/**
 * Convert the options into standard request format.
 *
 * @param {Array<Theater>} data
 * @return {undefined}
 */
MoviesRequestor.prototype._formatResponse = function(theaters) {
    // Theater:
    //    name:
    //    location:
    //    items: [{link, title}]
    var movies = [];
    theaters.forEach(function(t) {
        var newMovies = t.items.map(this._createMovie.bind(this, t));
        movies = movies.concat(newMovies);
    }, this);
    return movies;
};

/**
 * Create the given movie response object.
 *
 * @param theater
 * @param movie
 * @return {undefined}
 */
MoviesRequestor.prototype._createMovie = function(theater, movie) {
    movie.theater = theater.name;
    movie.vicinity = theater.location;  // FIXME: Change vicinity to location
    movie.types = ['movies'];
    return movie;
};

MoviesRequestor.prototype._offlineRequest = function(req, done) {
    return done(null, this._formatResponse(movies));
};

module.exports = MoviesRequestor;
