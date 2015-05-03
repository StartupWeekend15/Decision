'use strict';

var google_places = require('googleplaces');
var GoogleRequestor = function(opts) {
    this._googlePlaces = new google_places(opts.apiKey, 'json');
};

GoogleRequestor.prototype.request = function(params, callback) {
    return this._googlePlaces.placeSearch(params, callback);
};

module.exports = GoogleRequestor;
