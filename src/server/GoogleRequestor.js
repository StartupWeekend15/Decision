'use strict';

var GoogleRequestor = function(opts) {
    this._googlePlaces = new google_places(opts.apiKey, 'json');
};

GoogleRequestor.prototype.request = this._googlePlaces.placeSearch;

module.exports = GoogleRequestor;
