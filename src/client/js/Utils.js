/*globals define*/
define([], function() {
    'use strict';

    var nop = function() {
        // no operation...
    };
    var isNonEmptyString = function(string) {
        return !!string;
    };

    return {
        isNonEmptyString: isNonEmptyString,
        nop: nop 
    };
});
