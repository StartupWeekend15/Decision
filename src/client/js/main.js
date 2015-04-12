/*globals define*/
// Main entry point for client side code
'use strict';

$.material.init()

// Manipulating the UI
$(function() {

  $("#slider").noUiSlider({
  	start: 10,
    step: 0.5,
  	range: {
  		min: 0.5,
  		max: 30
    }
  });

  $('#slider').on('slide', function (event, val) {
    $('#distance').html(val.slice(0, -1))
  });
});

// Set up require
require.config({
    paths: {
        shake: './lib/shake',
        dot: './lib/doT.min',
        async: './lib/async'
    },
    map: {
        '*': {
            'text': './lib/require-text/text'
        }
    }
});


define(['Client',
       'Utils',
       'shake',
       'text!../html/result.html'],
       function(Client,
                Utils,
                shake,
                resultTemplate) {
    // Initialize shake listening
    // TODO

    // This really should be refactored and put in Utils
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
    var updatePosition = function(pos) {
        // Check for a certain amount of movement?
        console.log('Updating position', pos.coords);
        client.setLocation(pos.coords.latitude, pos.coords.longitude);
    };
    // Check for navigator and stuff
    if (navigator.geolocation) {
        // Update positions
        navigator.geolocation.getCurrentPosition(updatePosition);
    } else {
        console.error('Geolocation not supported by this browser');
    }

    // Hook up the click listeners
    // Attach click listener for each of the categories' ids
    var displayOption = function(id, option) {

        option = option || {
          name: "Starbucks",
          icon: "http://maps.gstatic.com/mapfiles/place_api/icons/cafe-71.png",
          rating: 4,
          vicinity: "402 21st Avenue South, Nashville",
          opening_hours: {open_now: true, weekday_text: []},
          price_level:2
        };

        var $rt = $(resultTemplate);
        $rt.find('.result__name').html(option.name);
        $rt.find('.result__hours').html('9:00 AM - 5:00 PM');
        $rt.find('.result__phone').html('(555) 555-5555');
        $rt.find('.result__photo').html('<img src="' + option.icon + '">');
        $rt.find('.result__vicinity').html(option.vicinity);

        $('.jumbotron').replaceWith($rt);

        // Set on shake listener/button click listener for the new UI element
        //document.getElementById('shakeButton').onclick = function() {
            //var opt = client.getAnotherOption(id);
            //displayOption(id, opt);
        //};
        console.log('Displaying option for', id,'(', option.name, ')');
    };

    var onOptionClicked = function(id) {
        client.getOption(id, function(result) {
            displayOption(id, result);
        });
    };

    for (var id in categories) {
        document.getElementById(id).onclick = onOptionClicked.bind(null, id);
    }

});
