'use strict';

var foodOptions = require('../../test/assets/foodOptions'),
    entertainmentOptions = require('../../test/assets/entertainmentOptions'),
    recreationOptions = require('../../test/assets/recreationOptions');

var TestRequestor = function() {
    console.log('Using Testing Requestor');
};

TestRequestor.prototype.request = function(params, callback) {
    console.log('params are', params);
    return callback(null, {results: foodOptions});
};

module.exports = TestRequestor;
