/*globals define*/


define([
    'intern!object',
    'intern/chai!assert',
    'intern!bdd',
    'intern/dojo/node!../../../src/server/Server',
    'require'
    ], function (registerSuite, assert, bdd, Server, require) {
        'use strict';
        
        var port = 5492,
            app;
        bdd.describe('Index', function() {
            bdd.before(function(done) {
                console.log('Starting server:', Server);
                app = new Server({requestor: 'Test', port: port});
                app.start(done);
            });

            bdd.it('should load main page', function() {
                console.log('Starting test...');
                return this.remote
                    .get('http://localhost:'+port)
                    .setFindTimeout(5000)
                    .findByCssSelector('.logo')
                    .isDisplayed()
                    .then(function(displayed) {
                        console.log('displayed is', displayed);
                        assert(displayed, 'Logo is not found');
                    });
            });
        });

        bdd.describe('Food', function() {
            bdd.it('should load first food option', function() {
                return this.remote
                    .get('http://localhost:'+port)  // Load the page
                    .setFindTimeout(10000)  // wait 10 secs for it to load
                    .findByCssSelector('#foodButton')  // Find the food button
                    .click()  // Click the food button
                    .end()  // stop the click event
                    .findByCssSelector('.result__vicinity')  // find an element in the results page
                    .isDisplayed()  // Check if .result_vicinity is displayed
                    .then(function(displayed) {  // load the isDisplayed result
                        assert(displayed, 'First option not loaded');
                    });
            });

            bdd.it('should load 2 food options', function() {
                return this.remote
                    .get('http://localhost:'+port)
                    .setFindTimeout(10000)
                    .findByCssSelector('#foodButton')
                    .click()
                    .end()
                    .setFindTimeout(10000)
                    // "Next" button
                    .findByCssSelector('#nextButton')
                    .click()
                    .end()

                    .findByCssSelector('.result__vicinity')
                    .isDisplayed()
                    .then(function(displayed) {
                        assert(displayed, 'First option not loaded');
                    });
            });
        });
    });
