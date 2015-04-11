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

    var CATEGORIES = [
        'food',
        'recreation'
    ];
    var Client = function(opts) {
        this.host = opts.host;
        this.port = opts.port;
        this.categories = opts.categories || CATEGORIES;

        this.lat = 0;
        this.lng = 0;

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

        this.categories.forEach(function(c) {
            this._requestOptions(c);
        },this);
    };

    /**
     * Request the local options from the server for the given category
     *
     * @param {String} category
     * @return {undefined}
     */
    Client.prototype._requestOptions = function(category) {
        var req = new XMLHttpRequest();

        req.onload = function(e) {
            console.log('RESPONSE',req.responseText);
            this.options[category] = [];
        }.bind(this);
        req.open('get', '/places', true);
        req.send();
    };

    /**
     * Get an option given the category provided. Use cached data if possible.
     *
     * @param {String} category
     * @return {undefined}
     */
    Client.prototype.getOption = function(category) {
        console.log('Getting option for', category);
        this.remainingOptions[category] = this.options[category].slice();
        return this._getOption(category);
    };

    /**
     * Get an option given the 
     *
     * @private
     * @param category
     * @return {undefined}
     */
    Client.prototype._getOption = function(category) {
        var count = this.remainingOptions[category].length,
            index = Math.random(Math.floor()*count);

        return this.remainingOptions[category].splice(index,1)[0];
    };

    return Client;
});
