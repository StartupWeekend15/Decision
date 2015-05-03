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
       , 'lodash'
       , 'text!../html/no_more.html'
       , 'text!../html/result.html'
       ],
function(Client, Utils, shake, _, noMoreTemplate, resultTemplate) {

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
  
  // Hook up the click listeners
  // Attach click listener for each of the categories' ids
  var displayNoOption = function() {
      var $rt = $(noMoreTemplate);
      $('.content').html($rt);

      console.log('No options found!');
      // alert('No more new options for you. You can restart!');
      // location.reload();
  };
  var displayOption = function(id, option) {
      if (!option) {
          return displayNoOption();
      }

      if (option === null) {
          console.log("Shouldn't be called with null option");
          option = option || {
            name: "Starbucks",
            icon: "http://maps.gstatic.com/mapfiles/place_api/icons/cafe-71.png",
            rating: 4,
            vicinity: "402 21st Avenue South, Nashville",
            opening_hours: {open_now: true, weekday_text: []},
            price_level:2
          };
      }

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
      
      console.log('option');
      console.log(option);

      var $rt = $(resultTemplate);
      $rt.find('.result__name').html(option.name);
      $rt.find('.result__photo').html('<img src="' + option.icon + '">');
      $rt.find('.result__type').html(option.type);
      $rt.find('.result__price').html(price_string);
      $rt.find('.result__ratings').html(rating_string);
      $rt.find('.result__vicinity').html('<a href="http://maps.google.com/?q=' + addressQuery + '" target="_blank">'+option.vicinity+'</a>');

      $('.content').html($rt);

      console.log('Displaying option for', id,'(', option.name, ')');
  };

  var onOptionClicked = function(id) {
      currentId = id;
      client.getOption(id, function(result) {
          displayOption(id, result);
          console.log(id);
      });
  };

  for (var id in categories) {
      document.getElementById(id).onclick = onOptionClicked.bind(null, id);
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

    // Set event listener
    $('.content').on('click', '.result__retry', function(){
      var opt = client.getAnotherOption(currentId);
      displayOption(currentId, opt);
    });

  });

});
