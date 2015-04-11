/*globals describe,it*/
'use strict';

// HTTP Request example
var http = require('http');

describe('Server API tests', function() {

    it('Should return restaurants given a places request', function(done) {
        // Add server test
        var post_data = 'asdafd',
            options = {
            host: 'example.com',
            port: '80',
            path: '/path',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post_data.length
            }
        };

        var req = http.request(options, function(res) {
            // response is here
            done();
        });

        // write the request parameters
        req.write('post=data&is=specified&like=this');
        req.end();
        // HTTP Request example END

        // TODO
    });

});
