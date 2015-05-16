/*globals after,describe,it,before*/
/*jshint esnext:true */
const Browser = require('zombie'),
      Server = require('../../src/server/Server'),
      dotenv = require('dotenv'),
      port = 2489;

// We're going to make requests to http://example.com/signup
// Which will be routed to our test server localhost:2489
Browser.localhost('example.com', port);

describe('Choozeroo Zombie Tests', function() {
    'use strict';
    const browser = new Browser();
    before(function() {
        dotenv.load();
    });
    var server;

    var functionalTests = function() {
        before(function(done) {
            this.timeout(50000);
            browser.visit('/', done);
        });

        it('should load index', function() {
            browser.assert.success();
            browser.assert.element('.logo');
        });

        var testBtns = function(type, btnId) {
            before(function(done) {
                this.timeout(10000);
                browser.visit('/', done);
            });

            it('should click on '+type+' and see result', function() {
                var btns = browser.queryAll('#'+btnId);

                btns[0].onclick();
                //browser.fire('click', btns[0], function() {
                browser.assert.element('.result');
                //});
            });

            it('should get 2nd result for '+type, function() {
                var btns = browser.queryAll('#nextBtn');
                btns[0].onclick();
                browser.assert.element('.result');
            });

            // TODO: Add extra tests
            //it('should return to the main page', function() {
                //var btns = browser.queryAll('#logo');
                //btns[0].onclick();
            //});

        };

        describe('Food', testBtns.bind(this, 'food', 'foodButton'));

        describe('Fun', testBtns.bind(this, 'fun', 'entertainmentButton'));

        describe('Flicks', testBtns.bind(this, 'movies', 'flicksButton'));
    };

    describe('Dev server', function() {
        before(function(done) {
            process.env.NODE_ENV = 'development';
            server = new Server({port:port});
            server.start(done);
        });

        describe('Functional tests', functionalTests);

        after(function(done) {
            server.stop(done);
        });
    });

    describe('Offline server', function() {
        before(function(done) {
            process.env.NODE_ENV = 'offline';
            server = new Server({port:port});
            server.start(done);
        });

        describe('Functional tests', functionalTests);

        after(function(done) {
            server.stop(done);
        });
    });

});
