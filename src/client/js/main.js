/*globals geolocator,alert,_,confirm,define*/
// Main entry point for client side code
'use strict';

$.material.init();

// Set up require
require.config({
  paths: {
    shake: './lib/shake',
    dot: './lib/doT.min',
    lodash: './lib/lodash.min',
    async: './lib/async'
  },
  map: {
    '*': {
      'text': './lib/require-text/text'
    }
  }
});

define([ 'Client'
       , 'Utils'
       , 'shake'
       , './controllers/Controller'
       , 'lodash'
       , 'text!../html/no_more.html'
       , 'text!../html/result.html'
       ],
function(Client, Utils, shake, Controller, _, noMoreTemplate, resultTemplate) {

  // Initialize shake listening
  // TODO

  // This really should be refactored and put in Utils
  var currentId = null;
  var getCategoryMap = function() {
      var buttons = $('.genre'),
          categories = {};

      for (var i = buttons.length; i--;) {
          categories[buttons[i].getAttribute('id')] = buttons[i].getAttribute('data-categories')
              // Get array of the categories
              .split(' ')
              // Remove '' from categories
              .filter(Utils.isNonEmptyString);
      }
      return categories;
  };

  var categories = getCategoryMap(),
      client = new Client(categories);

    console.log('categories:');
    console.log(categories);

  // Create the controllers
  var Contr = Controller.bind(this, client);
  $('.genre').each(function(i, btn) {
      new Controller(client, btn);
  });


  // get location by ip (faster than browser)
  geolocator.locateByIP(function(location) {
    updateLocation('coords by IP', location.coords);
    var html5Options = { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 };
    // get more accurate location from the browser 
    geolocator.locate(function(location) {
      updateLocation('coords', location.coords);
    }, function(error) {
      console.log(error);
    }, false, html5Options);
  }, function(error) {
    console.log(error);
  }, 2);

  function updateLocation(src, coords) {
    console.info(src, coords.latitude, coords.longitude);
    client.setLocation(coords.latitude, coords.longitude);
  }
  
  // Manipulating the UI
  $(function() {

    $('.container').on('click', '.result__restart, .logo', function(){
      location.reload();  // FIXME Change this not to reload the whole page...
    });

    $('.content').on('click', '.result__accept', function(){
      //confirm('Awesome! Tweet now?');
      location.reload();  // FIXME Change this not to reload the whole page...
    });

  });

});
