/*globals before,describe,it*/

// HTTP Request example
var Utils = require('../src/server/Utils'),
    assert = require('assert');

describe('Server utility function tests', function() {
    'use strict';

    it('Should filter out places that are closed', function(done){
        var places = [
            { 
                icon: 'http://maps.gstatic.com/mapfiles/place_api/icons/cafe-71.png',
                name: 'Starbucks',
                opening_hours: { open_now: false, weekday_text: [] },
                price_level: 2,
                vicinity: '424 Church Street #100, Nashville' 
            }];
        var places_filt = Utils.filterClosed(places);
        assert.equal(places_filt.length,0);
        done();
    });

    it('Should not filter out places with no open_hours info', function(done){
        var places = [
            { 
                icon: 'http://maps.gstatic.com/mapfiles/place_api/icons/cafe-71.png',
                name: 'Bongo Java',
                price_level: 1,
                rating: 4,
                vicinity: '2007 Belmont Boulevard, Nashville'
            },
            { 
                icon: 'http://maps.gstatic.com/mapfiles/place_api/icons/cafe-71.png',
                name: 'Starbucks',
                opening_hours: { open_now: true, weekday_text: [] },
                price_level: 2,
                vicinity: '424 Church Street #100, Nashville' 
            }];
        var places_filt = Utils.filterClosed(places);

        assert.equal(places.length, places_filt.length);
        done();
    });

    describe('gps2zip', function() {
        it('Should change lat long to zip', function(done){
            var lat = 36.15768,
            lng = -86.764677;
            var zip = Utils.latlng2zip(lat,lng);
            console.log("The converted zip is: ", zip.zip_code);
            done();
        });
    });

    describe('initializeEntry', function() {
        it('Should create a key in the dictionary', function(){
            var dict = {};
            Utils.initializeEntry(dict, 'k1');
            assert.equal(typeof dict.k1, 'object');
        });

        it('Should create the multiple entries given multiple keys', function(){
            var dict = {};
            Utils.initializeEntry(dict, 'k1', 'k2', 'k3');
            assert.equal(typeof dict.k1.k2.k3, 'object');
        });

        it('Should preserve values already existing', function(){
            var dict = {k1: {test: 1}};
            Utils.initializeEntry(dict, 'k1', 'k2', 'k3');
            assert.equal(dict.k1.test, 1);
        });
    });
});

