'use strict';


var TestRequestor = function() {
    console.log('Using Testing Requestor');
};

<<<<<<< HEAD:src/server/requestors/TestRequestor.js
=======
TestRequestor.prototype.request = function(params, callback) {
    console.log('params are', params);
    // Filter by the categories
    var types = params.types.split('|'),
    categoryFilter = this._hasCategory.bind(this, types),
        results = options.filter(categoryFilter);

    return callback(null, {results: results});
};

>>>>>>> 1ebff51b3ad0531f52ecd727d76a33b03c1a4dfe:src/server/TestRequestor.js
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
