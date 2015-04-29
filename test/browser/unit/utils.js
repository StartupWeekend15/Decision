/*globals define*/
define(function(require) {
    'use strict';
    
    var bdd = require('intern!bdd'),
        assert = require('intern/chai!assert'),
        utils = require('src/client/js/Utils');

    bdd.describe('Utils', function() {
        bdd.describe('isNonEmptyString', function() {
            bdd.it('should detect non empty string', function() {
                assert.strictEqual(utils.isNonEmptyString('a'), true,
                '"a" is a non empty string but was reported as empty');
            });

            bdd.it('should detect empty string', function() {
                assert.strictEqual(utils.isNonEmptyString(''), false,
                '"" is an empty string but was reported as non-empty');
            });
        });

        bdd.describe('NOP', function() {
            bdd.it('should return undefined', function() {
                assert.strictEqual(utils.nop(''), undefined,
                'nop returned a value...');
            });
        });
    });
});
