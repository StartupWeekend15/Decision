/*globals define*/
'use strict';

var R = require('ramda');

// Filtering
var filterClosed = function(results) {
    // If the key is not there, we'll assume it's open
    var isOpen = function(place){
        var hours = place['opening_hours'];
        if (hours === undefined)
            return true;

        if (hours.hasOwnProperty('open_now') && hours['open_now'])
            return true;

        return false;
    }
    return R.filter(isOpen, results);
};


module.exports = {
    filterClosed: filterClosed,
};

