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

var getCategoryMap = function() {
    var buttons = $('.button'),
        categories = {};

    for (var i = buttons.length; i--;) {
        categories[buttons[i].getAttribute('id')] = buttons[i].getAttribute('data-categories')
            // Get array of the categories
            .split(' ')
            // Remove '' from categories
            .filter(function(c) {return !!c;});
    }
    return categories;
};

// Set up require
require.config({
    paths: {
        jquery: './lib/jquery-2.1.3.min'
    },
    map: {
        '*': {
            'text': './lib/require-text/text'
        }
    }
});


define(['Client'], function(Client) {
    // Get 
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
    for (var id in categories) {
        document.getElementById(id).onclick = client.getOption.bind(client, id);
    }
    
});
