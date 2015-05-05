/*globals beforeEach,before,assert,describe,it*/
'use strict';

var requirejs = require('requirejs'),
    assert = require('assert'),  //jshint ignore: line
    path = require('path'),
    _ = require('lodash'),
    Server = require('../src/server/Server'),
    TEST_PORT = 9343,
    __dirname = path.resolve(path.dirname());  //jshint ignore: line

requirejs.config({
    baseUrl: __dirname+'/src/client/js/',
    paths: {
        shake: './lib/shake',
        dot: './lib/doT.min',
        lodash: './lib/lodash.min',
        async: './lib/async'
    }
});

describe('Client tests', function() {
    before(function(done) {
        var server = new Server({requestor: 'Test',
                                 port: TEST_PORT});
        server.start(done);
    });

    var app,
        client;

    describe('Basic tests', function() {

        it('should invert categoryMap', function(done) {
            requirejs(['Client'],
                      function(Client) {

                          var categoryMap = {
                              a: 1,
                              b: 2,
                              c: 3
                          };
                          client = new Client(categoryMap);

                          var value;
                          for (var id in client.categoryMap) {
                              value = client.categoryMap[id];
                              assert(id === client.inverseCategoryMap[value]);
                          }

                          done();
                      });
        });
    });

    describe('Updated params tests', function() {
        beforeEach(function(done) {
            requirejs(['Client'],
                      function(Client) {

                          client = new Client({
                Food: 'cafe rest food',
                Rec: 'night_club bars',
                Fun: 'movies park'
            });
                          done();
                      });
        });

        it.skip('should create a formatted request', function(done) {
            client._request = function(endpoint, params, callback) {
                assert(endpoint === '/places');
                done();
                //assert(endpoint === '/places');
            };

            client._requestOptions(['Food', 'Fun'], 2, function(){});
        });

        it('should parse a formatted response', function(done) {
            client.categoryMap = {
                Food: 'cafe rest food',
                Rec: 'night_club bars',
                Fun: 'movies park'
            };

            var info = {
                    'cafe rest food': [1, 2, 3],
                    'night_club bars': [2, 3, 4],
                    'movies park': [45]
                },
                req = {
                    responseText: JSON.stringify(info)
                };

            client._handleResponse(req, function() {
                var testObj = _.mapValues(client.categoryMap, 
                          function(val) {
                              return info[val];
                    });
                    assert(_.isEqual(testObj, client.options));
                    // Compare testObj and client.options
                done();
            });
            // TODO
        });
    });

    it.skip('should return a random option', function(done) {
    });


});
