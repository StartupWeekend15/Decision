/*globals before,describe,it*/

// HTTP Request example
var MoviesRequestor = require('../src/server/requestors/MoviesRequestor'),
    fs = require('fs'),
    movieOptions = require('./assets/movieOptions'),
    assert = require('assert');

describe('Movies requestor tests', function() {
    'use strict';
    var requestor;
    before(function() {
        requestor = new MoviesRequestor(37211);
        requestor._getRssFile = function (parser, done) {
            fs.createReadStream(__dirname+'/assets/moviesnearme_37211.rss')
            .on('error', done)
            .pipe(parser);
        };
    });

    it('Gets rss url given zip code', function(done){
        assert.equal(requestor._getUrl(),'http://www.fandango.com/rss/moviesnearme_37211.rss');
        done();
    });

    it('Fetches movies playing near zip code', function(done){
        requestor._fetchMovies(function(err, movies){
            assert.deepEqual(movies, movieOptions);
            done();
        });
    });

});

