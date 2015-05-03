/*globals escape,prompt,define*/
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
define(['Utils', 'lodash'], function(Utils, _) {

    var Client = function(categories) {
        this.categoryMap = categories;
        this.inverseCategoryMap = _.invert(this.categoryMap);

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

        // Request a single option
        this._requestOptions(Object.keys(this.categoryMap), 1, callback);
    };

    Client.prototype.setDistance = function (dist) {
        console.log('Setting distance');
        this.distance = dist;
        this.onUpdate();
    };

    /**
     * Create the request from the client info.
     *
     * @param {ButtonId} ids
     * @param {Number} num
     * @param {Function} callback
     * @return {undefined}
     */
    Client.prototype._requestOptions = function(ids, num, callback) {
        var distance = (this.distance/0.6)*1000, // Convert to meters
            types,
            params;

        // Prep the types
        types = ids.reduce(function(prev, curr) {
            return prev+'&cat[]='+this.categoryMap[curr].join(';');
        }.bind(this), '');

        types = types.replace(/ /g, '%20');
        console.log('types is', types);
        params = 'lat='+this.lat+'&lng='+this.lng+
            '&dist='+distance+types+'&num='+num;
        this._request('/places', params, callback);
    };

    /**
     * Make an HTTP request to the server
     *
     * @param {String} endpoint
     * @param {String} params
     * @param {Function} callback
     * @return {undefined}
     */
    Client.prototype._request = function(endpoint, params, callback) {
        var req = new XMLHttpRequest();
        req.onload = this._handleResponse.bind(this, req, callback);
        req.open('get', endpoint+'?'+params, true);
        req.send();
    };

    /**
     * Record the options returned from the server
     *
     * @param {XMLHttpRequest} request
     * @param {Function} callback
     * @return {undefined}
     */
    Client.prototype._handleResponse = function(request, callback) {
        var id,
            res = JSON.parse(request.responseText);

            console.log('inverseCatMap:', this.inverseCategoryMap);
        _.forIn(res, function(value, key) {
            id = this.inverseCategoryMap[key];
            console.log('\nkey is', key);
            console.log('value is', value);
            console.log('id is', id);
            this.options[id] = value;
        }.bind(this));

        callback();
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
