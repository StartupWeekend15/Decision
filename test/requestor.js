/*globals before,describe,it*/
'use strict';
var TestRequestor = require('../src/server/TestRequestor'),
    assert = require('assert'),
    R = require('ramda'),
    requestor;

describe('Test Requestor Tests', function() {
    before(function() {
        requestor = new TestRequestor();
    });

    // Helpers
    var getAttribute = function(attr, obj) {
        return obj[attr];
    };

    it('should filter by single category', function(done) {
        requestor.request({types: ['cafe']}, function(err, response) {
            var results = response.results.map(getAttribute.bind(null, 'types'));
            assert(!err);
            assert(results.every(R.contains('cafe')));
            assert(results.length > 0);
            done();
        });
    });

    it('should filter by establishment category', function(done) {
        requestor.request({types: ['establishment']}, function(err, response) {
            var results = response.results.map(getAttribute.bind(null, 'types'));
            assert(!err);
            assert(results.every(R.contains('establishment')));
            assert(results.length > 0);
            done();
        });
    });

    it('should filter by multiple categories', function(done) {
        requestor.request({types: ['spa', 'camping']}, function(err, response) {
            var results = response.results.map(getAttribute.bind(null, 'types'));
	    var nonspa = R.reject(R.contains('spa'), results);
            assert(!err);
            assert(nonspa.every(R.contains('camping')));
            assert(results.length > 0);
            done();
        });
    });

    it('should return nothing', function(done) {
        requestor.request({types: [';asjdf;lkasjdflk']}, function(err, response) {
            var results = response.results.map(getAttribute.bind(null, 'types'));
            assert(!err);
            assert(results.length === 0);
            done();
        });
    });
});
