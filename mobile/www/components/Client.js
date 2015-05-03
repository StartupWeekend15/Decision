/*globals prompt,define*/
'use strict';

/*
 * This module will generate a random activity to do given the activities
 * received from the server.
 *
 * The idea is that it will be used as follows:
 *      + Page loads (initialize)
 *      + Set the location
 *
 *      + Request the category options
 */
define(['Utils'], function(Utils) {

    var Client = function(categories) {
        this.categoryMap = categories;

        this.lat = 0;
        this.lng = 0;
        this.distance = 10;  // miles
        this.entropy = 10;  // options to randomly choose between

        this.options = {};
        this.init();

        this.remainingOptions = {};
    };

    Client.prototype.init = function() {
        // Initialize options
        for (var id in this.categoryMap) {
            this.options[id] = [];
        }
    };

    /**
     * Update the current location. Also refresh the options.
     *
     * @param {Number} lat
     * @param {Number} lng
     * @return {undefined}
     */
    Client.prototype.setLocation = function(lat, lng) {
        this.lat = lat;
        this.lng = lng;
        this.onUpdate();
    };

    Client.prototype.getLatLngFromZip = function (zip, cb) {
        var self = this;
        if (!/^\d{5}$/.test(zip)) {
            console.log('Zip code is invalid');
            return cb();
        }
        $.get('http://maps.googleapis.com/maps/api/geocode/json?address=' + zip, function (json) {
            self.lat = json.results[0].geometry.location.lat;
            self.lng = json.results[0].geometry.location.lng;
            self.onUpdate(cb);
        }, 'json');
    };

    Client.prototype.onUpdate = function (cb) {
        var len,
            callback;

        cb = cb || Utils.nop;
        len = Object.keys(this.categoryMap).length;
        callback = function() {
            if (--len === 0) {
                cb();
            }
        };

        for (var id in this.categoryMap) {
            this._requestOptions(id, callback);
        }
    };

    Client.prototype.setDistance = function (dist) {
        console.log('Setting distance');
        this.distance = dist;
        this.onUpdate();
    };

    /**
     * Request the local options from the server for the given category
     *
     * @param {String} category
     * @return {undefined}
     */
    Client.prototype._requestOptions = function(id, callback) {
        var req = new XMLHttpRequest(),
            distance = (this.distance/0.6)*1000, // Convert to meters
            types = this.categoryMap[id].reduce(function(p,c) {
                return p+'&cat[]='+c;
            }, ''),
            params = 'lat='+this.lat+'&lng='+this.lng+
                '&dist='+distance+types+'&num='+this.entropy;

        req.onload = function(e) {
            this.options[id] = JSON.parse(req.responseText);
            callback();
        }.bind(this);
        req.open('get', '/places?'+params, true);
        req.send();
    };

    /**
     * Get an option given the category provided. Use cached data if possible.
     *
     * @param {String} category
     * @return {undefined}
     */
    Client.prototype.getOption = function(id, cb) {
        var fn = function() {
            console.log('Getting option for', id);
            this.remainingOptions[id] = this.options[id].slice();
            console.log('there', this.remainingOptions[id]);
            return cb(this._getOption(id));
        }.bind(this);
        if (!this.lat) {
            var zip = prompt("What's your zip code?");
            this.getLatLngFromZip(zip, fn);
        } else {
            fn();
        }
    };

    Client.prototype.getAnotherOption = function(id) {
        if (!this.remainingOptions[id])
            return null;
        var count = this.remainingOptions[id].length,
            index = Math.floor(Math.random()*count);

        if (count > 0) {
            return this.remainingOptions[id].splice(index,1)[0];
        } else {
            return null;
        }
    };

    /**
     * Get an option given the 
     *
     * @private
     * @param category
     * @return {undefined}
     */
    Client.prototype._getOption = function(id) {
        var count = this.remainingOptions[id].length,
            index = Math.floor(Math.random()*count);

        return this.remainingOptions[id].splice(index,1)[0];
    };

    return Client;
});
