/*globals define*/
// Main entry point for client side code
'use strict';

// Set up require
require.config({
    paths: {
        jquery: './lib/jquery-2.1.3.min',
    }
});

define(['Client'], function(Client) {
    var client = new Client({});
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
    // TODO
    
    $(function() {
      $( "#slider" ).slider({
        min: 1,
        max: 20,
        step: 1,
        value: 5,
        slide: function (event, ui) {
          $("#distance").html(ui.value);
        }
      });
    });

});
