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
    });
