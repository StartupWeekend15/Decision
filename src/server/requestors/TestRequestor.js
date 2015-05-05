'use strict';

var options = require('../../../test/assets/options'),
    _ = require('lodash');

var TestRequestor = function() {
    console.log('Using Testing Requestor');
};

TestRequestor.prototype.request = function(params, callback) {
    console.log('params are', params);
    // Filter by the categories
    var categoryFilter = this._hasCategory.bind(this, params.types),
        results = options.filter(categoryFilter);

    return callback(null, {results: results});
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
