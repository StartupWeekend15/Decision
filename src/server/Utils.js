/*globals define*/
var R = require('ramda'),
    gps = require('gps2zip'),
    _ = require('lodash');

// Filtering
var filterClosed = function(results) {
    'use strict';
      
    // If the key is not there, we'll assume it's open
    var isOpen = function(place){
        var hours = place.opening_hours;
        if (hours === undefined)
            return true;

        if (hours.hasOwnProperty('open_now') && hours.open_now)
            return true;

        return false;
    };
    return R.filter(isOpen, results);
};

var latlng2zip = function(lat,lng){
   return  gps.gps2zip(lat,lng);
};

var getAttribute = function(attr, obj){
    return obj[attr];
};

/**
 * Check if a single result has any of the categories
 *
 * @param {Array<String>} categories
 * @param {Object} result
 * @return {Boolean}
 */
var hasCategory = function(categories, result) {
    var shared = _.intersection(categories, result.types);
    return shared.length > 0;
};

var initializeEntry = function(dict, key1, key2) {
    for (var i = 1; i < arguments.length; i++) {
        if (!dict[arguments[i]]) {
            dict[arguments[i]] = {};
        }
        dict = dict[arguments[i]];
    }
};


module.exports = {
    filterClosed: filterClosed,
    getAttribute: getAttribute,
    latlng2zip: latlng2zip,
    initializeEntry: initializeEntry,
    hasCategory: hasCategory
};

