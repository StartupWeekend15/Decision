/*globals before,describe,it*/

// HTTP Request example
var Cacher = require('../src/server/Cacher'),
    assert = require('assert'),
    request,
    cacher;

describe('Cacher tests', function() {
    'use strict';

    before(function() {
        cacher = new Cacher();
        request = {location: [36.1515318, -86.788856],
                   types: ['movies', 'cafe'],
                   radius: 122};
    });

    it('should store request', function() {
        cacher.store(request, 'test');
    });

    it('should retrieve cached request', function() {
        cacher.retrieve(request, function(item) {
            assert.equal(item, 'test');
        });
    });
});

