/*globals define*/
define([], function() {
    'use strict';

    var isNonEmptyString = function(string) {
        return !!string;
    };

    return {
        isNonEmptyString: isNonEmptyString 
    };
});
