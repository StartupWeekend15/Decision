/*globals describe,it*/

// HTTP Request example
var http = require('http');
var urlencode = require('urlencode');

describe('Server API tests', function() {
    'use strict';

    it('Should return restaurants given a places request', function(done) {
        // Add server test

       //  https://maps.google.com/maps?ll=36.15768,-86.764677&spn=0.014986,0.033023&t=m&z=16

        var get_data = 'lat=36.15768&lng=-86.764677&dist=1000&cat=restaurant',

        options = {
            host: 'localhost',
            port: '3700',
            path: '/places?'+get_data,
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        var req = http.request(options, function(res) {
            // response is here
            done();
        });

        // write the request parameters
        req.end();
        // HTTP Request example END

        // TODO
    });

});
