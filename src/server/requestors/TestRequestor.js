'use strict';


var TestRequestor = function() {
    console.log('Using Testing Requestor');
};

/**
 * Check if a single result has any of the categories
 *
 * @param {Array<String>} categories
 * @param {Object} result
 * @return {Boolean}
 */
TestRequestor.prototype._hasCategory = function(categories, result) {
    var shared = _.intersection(categories, result.types);
    return shared.length > 0;
};

module.exports = TestRequestor;
