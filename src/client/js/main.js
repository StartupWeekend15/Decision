/*globals define*/
// Main entry point for client side code
'use strict';

// Manipulating the UI
$(function() {
  $( "#slider" ).slider({
    min: 0.5,
    max: 30,
    step: 0.5,
    value: 5,
    slide: function (event, ui) {
      $("#distance").html(ui.value);
      // Add stuff
      // TODO
    }
  });
});

// Set up require
require.config({
    paths: {
        shake: './lib/shake',
        async: './lib/async'
    }
});


define(['Client', 'Utils', 'shake'], function(Client, Utils, shake) {
    // Initialize shake listening
    // TODO

    // This really should be refactored and put in Utils
    var getCategoryMap = function() {
        var buttons = $('.button'),
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
