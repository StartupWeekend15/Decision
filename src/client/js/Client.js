/*globals define*/
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
define([], function() {

    var Client = function(categories) {
        this.categoryMap = categories;

        this.lat = 0;
        this.lng = 0;
        this.distance = 10;  // miles

        this.options = {};
        this.remainingOptions = {};
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

        for (var id in this.categoryMap) {
            this._requestOptions(id);
        }
    };

    Client.prototype.setZipLocation = function (zip) {
        console.log('Setting zip location', zip);
        this.zip = zip;
    };

    /**
     * Request the local options from the server for the given category
     *
     * @param {String} category
     * @return {undefined}
     */
    Client.prototype._requestOptions = function(id) {
        var req = new XMLHttpRequest(),
            distance = (this.distance/.6)*1000, // Convert to meters
            params = 'lat='+this.lat+'&lng='+this.lng+
                '&dist='+distance+'&categories='+JSON.stringify(this.categoryMap[id]);

        req.onload = function(e) {
            this.options[id] = JSON.parse(req.responseText);
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
    Client.prototype.getOption = function(id) {
        if (!this.lat) {
            var zip = prompt("What's your zip code?");
            this.setZipLocation(zip);
        } else {
            console.log('Getting option for', id);
            this.remainingOptions[id] = this.options[id].slice();
            return this._getOption(id);
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
