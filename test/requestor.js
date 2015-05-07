/*globals before,describe,it*/
'use strict';
var GoogleRequestor = require('../src/server/requestors/GoogleRequestor'),
    assert = require('assert'),
    R = require('ramda'),
    requestor;

describe('Google Requestor Tests', function() {
    before(function() {
        process.env.NODE_ENV = 'offline';
        requestor = new GoogleRequestor();
    });

    // Helpers
    var getAttribute = function(attr, obj) {
        return obj[attr];
    };

    it('should filter by single category', function(done) {
        requestor.request({types: ['cafe']}, function(err, results) {
            results = results.map(getAttribute.bind(null, 'types'));
            assert(!err);
            assert(results.every(R.contains('cafe')));
            assert(results.length > 0);
            done();
        });
    });

    it('should filter by establishment category', function(done) {
        requestor.request({types: ['establishment']}, function(err, results) {
            results = results.map(getAttribute.bind(null, 'types'));
            assert(!err);
            assert(results.every(R.contains('establishment')));
            assert(results.length > 0);
            done();
        });
    });

    it('should filter by multiple categories', function(done) {
        requestor.request({types: ['spa', 'camping']}, function(err, results) {
            results = results.map(getAttribute.bind(null, 'types'));
            var nonspa = R.reject(R.contains('spa'), results);

            assert(!err);
            assert(nonspa.every(R.contains('camping')));
            assert(results.length > 0);
            done();
        });
    });

    it('should return nothing', function(done) {
        requestor.request({types: [';asjdf;lkasjdflk']}, function(err, results) {
            results = results.map(getAttribute.bind(null, 'types'));
            assert(!err);
            assert(results.length === 0);
            done();
        });
    });
});
