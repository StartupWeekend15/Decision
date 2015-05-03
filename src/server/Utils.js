/*globals define*/
var R = require('ramda');
var gps = require('gps2zip');

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


module.exports = {
    filterClosed: filterClosed,
    latlng2zip: latlng2zip
};

