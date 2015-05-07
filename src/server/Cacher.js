'use strict';

var Utils = require('./Utils');

var Cacher = function() {
    this._cache = {};
};

Cacher.prototype.store = function(request, value) {
    var loc = request.location,
        types = request.types.join(','),
        radius = request.radius;

    Utils.initializeEntry(this._cache, loc, types, radius);  // if needed
    this._cache[loc][types][radius] = value.slice();
};

Cacher.prototype.retrieve = function(item, callback) {
    var loc = item.location.join(','),
        types = item.types.join(','),
        radius = item.radius;

    Utils.initializeEntry(this._cache, loc, radius);  // if needed
    if (this._cache[loc][types][radius]) {
        callback(this._cache[loc][types][radius].slice());
    } else {
        callback(null);
    }
};

module.exports = Cacher;
