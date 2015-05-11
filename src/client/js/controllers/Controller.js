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
        // FIXME
        //this.categories = categories;
        this._id = button.getAttribute('id');
        // Add click listener
        button.onclick = this._renderOption.bind(this);
        this.container = container || $('.content');

        // Container to display the result in
        this.container = container;
        this._client = client;
    };

    /**
     * Display the given option on the screen.
     *
     * @private
     * @return {undefined}
     */
    Controller.prototype._renderOption = function() {
        this._client.getOption(this._id, function(option) {
            if (!option) {
                this.renderNone();
            } else {  // Render the option
                this.renderOption(option);

                // Set event listener
                this.container.on('click', '.result__retry', function(){
                    var opt = this._client.getAnotherOption(this._id);
                    this._renderOption(this._id, opt);
                }.bind(this));
            }
        }.bind(this));
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
      var rating_string = '';
      while (option.rating >= 0.5) {
        if (option.rating >= 1) {
            rating_string += '<img src="star_full.png">';
            option.rating -= 1;
            continue;
        }
        if (option.rating >= 0.5) {
            rating_string += '<img src="star_half.png">';
            option.rating -= 0.5;
        }
      }
      var user_loc = {
        'latitude' : this._client.lat,
        'longitude' : this._client.lng
      };
      var result_loc = {
        'latitude' : option.location.lat,
        'longitude' : option.location.lng
      };
      var distance = Math.round(geolib.getDistance(user_loc, result_loc)/1609.34 * 10) / 10;
      
      console.log('option');
      console.log(option);

      var $rt = $(resultTemplate);
      $rt.find('.result__name').html(option.name);
      $rt.find('.result__photo').html('<img src="' + option.icon + '">');
      $rt.find('.result__type').html(option.type);
      $rt.find('.result__price').html(price_string);
      $rt.find('.result__distance').html(distance + ' miles away');
      $rt.find('.result__ratings').html(rating_string);
      $rt.find('.result__vicinity').html('<a href="http://maps.google.com/?q=' + addressQuery + '" target="_blank">'+option.vicinity+'</a>');

      this.container.html($rt);

      console.log('Displaying option for', this._id,'(', option.name, ')');
    };

    /**
     * Render a subsequent option.
     *
     * @return {undefined}
     */
    Controller.prototype.renderNext = function() {
        // FIXME
        // TODO
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

    return Controller;
});
