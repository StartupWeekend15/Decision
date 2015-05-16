/*globals geolib,define*/
/*
 * A `Controller` is a manager for a button on the screen. It will also control the rendering of the things on screen for the given categories.
 */

define([
       'text!../html/no_more.html',
       'text!../html/result.html'
], function(noMoreTemplate, resultTemplate) {
    'use strict';

    var Controller = function(client, button, container) {
        // Categories for the places
        this._id = button.getAttribute('id');
        // Add click listener
        button.onclick = this._renderFirst.bind(this);
        this.container = container || $('.content');

        // Container to display the result in
        this._client = client;
    };

    /**
     * Get the name of the given controller.
     *
     * @return {String} name
     */
    Controller.prototype.getName = function() {
        // Override this method when creating custom controllers
        return 'Basic';
    };

    /**
     * Render the first option.
     *
     * @return {undefined}
     */
    Controller.prototype._renderFirst = function() {
        this._client.getOption(this._id, this._renderOption.bind(this));
    };

    /**
     * Display the given option on the screen.
     *
     * @private
     * @param {Option} option
     * @return {undefined}
     */
    Controller.prototype._renderOption = function(option) {
        if (!option) {
            this.renderNone();
        } else {  // Render the option
            this.renderOption(option);
        }
    };

    /**
     * Display the given option.
     *
     * @param {Option} option
     * @return {undefined}
     */
    Controller.prototype.renderOption = function(option) {
      var addressQuery = option.vicinity.split(' ').join('+');
        console.log('option');
        console.log(option);
      var price_string = '';
      for (var i=0; i<option.price_level; i++) {
        price_string += '$';
      }
      var rating_string = this._createRatingText(option.rating);
      var user_loc = {
        'latitude' : this._client.lat,
        'longitude' : this._client.lng
      };
      var result_loc = {
        'latitude' : option.location.lat,
        'longitude' : option.location.lng
      };
      var distance = Math.round(geolib.getDistance(user_loc, result_loc)/1609.34 * 10) / 10;
      
      var $rt = $(resultTemplate);
      $rt.find('.result__name').html(option.name);
      $rt.find('.result__photo').html('<img src="' + option.icon + '">');
      $rt.find('.result__type').html(option.type);
      $rt.find('.result__price').html(price_string);
      $rt.find('.result__distance').html(distance + ' miles away');
      $rt.find('.result__ratings').html(rating_string);
      $rt.find('.result__vicinity').html('<a href="http://maps.google.com/?q=' + addressQuery + '" target="_blank">'+option.vicinity+'</a>');

      this.container.html($rt);

      // Add click listener
      document.getElementById('nextBtn').onclick = this.renderNext.bind(this);
      console.log('Displaying option for', this._id,'(', option.name, ')');
    };

    /**
     * Render the screen for no more options.
     *
     * @return {undefined}
     */
    Controller.prototype.renderNone = function() {
      var $rt = $(noMoreTemplate);
      $('.content').html($rt);

      console.log('No options found!');
    };

    /**
     * Render the next option. This will not display duplicates.
     *
     * @return {undefined}
     */
    Controller.prototype.renderNext = function() {
        var opt = this._client.getAnotherOption(this._id);
        this._renderOption(opt);
    };

    Controller.prototype._createRatingText = function(rating, total) {
        var result = '';
        total = total || 5;

        while (rating >= 0.5) {
            if (rating >= 1) {
                result += '<img src="star_full.png">';
                rating -= 1;
                continue;
            }
            if (rating >= 0.5) {
                result += '<img src="star_half.png">';
                rating -= 0.5;
            }
        }
        return result;
    };

    return Controller;
});
