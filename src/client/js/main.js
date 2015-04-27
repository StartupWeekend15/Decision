/*globals _,confirm,define*/
// Main entry point for client side code
'use strict';

$.material.init();

function randomBoxes() {
  var materialPallate = ['red', 'pink', 'purple', 'deep-purple', 'indigo', 'light-blue', 'cyan', 'teal', 'light-green', 'lime', 'orange', 'deep-orange', 'blue-grey', 'brown'];
  var colors = _(materialPallate).sample(3).shuffle().value();

  var foodIcons = ['icon-food', 'icon-drink', 'icon-cup', 'icon-drink2', 'icon-mug'];
  var entIcons = ['icon-movie', 'icon-music', 'icon-headphone', 'icon-gamepad'];
  var recIcons = ['icon-binocular', 'icon-sunny', 'icon-tree2', 'icon-leaf', 'icon-flower'];

  $('.genre').each(function (i, box) {
    removeClasses($(box));
    $(box).addClass('btn-material-' + colors[i]);
  });

  removeClasses($('#foodButton .genre-icon'));
  $('.genre-icon.icon-food').addClass(_.sample(foodIcons));

  removeClasses($('#entertainmentButton .genre-icon'));
  $('.genre-icon.icon-movie').addClass(_.sample(entIcons));

  removeClasses($('#recreationButton .genre-icon'));
  $('.genre-icon.icon-binocular').addClass(_.sample(recIcons));

  function removeClasses($el) {
    var classes = materialPallate.concat(foodIcons, entIcons, recIcons);
    _.forEach(materialPallate, function(clr) {
      $el.removeClass('btn-material-' + clr);
    });
  }
}



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


define(['Client',
       'Utils',
       'shake',
       'lodash',
       'text!../html/no_more.html',
       'text!../html/result.html'],
       function(Client,
                Utils,
                shake,
                _,
                noMoreTemplate,
                resultTemplate) {
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
    var displayNoOption = function() {
        var $rt = $(noMoreTemplate);
        $('.content').html($rt);

        console.log('No options found!');
    };
    var displayOption = function(id, option) {
        if (!option) {
            return displayNoOption();
        }

        // option = option || {
        //   name: "Starbucks",
        //   icon: "http://maps.gstatic.com/mapfiles/place_api/icons/cafe-71.png",
        //   rating: 4,
        //   vicinity: "402 21st Avenue South, Nashville",
        //   opening_hours: {open_now: true, weekday_text: []},
        //   price_level:2
        // };

        var addressQuery = option.vicinity.split(' ').join('+');

        var $rt = $(resultTemplate);
        $rt.find('.result__name').html(option.name);
        $rt.find('.result__hours').html('9:00 AM - 5:00 PM');
        $rt.find('.result__phone').html('(555) 555-5555');
        $rt.find('.result__photo').html('<img src="' + option.icon + '">');
        $rt.find('.result__vicinity').html('<a href="http://maps.google.com/?q=' + addressQuery + '" target="_blank">'+option.vicinity+'</a>');

        $('.content').html($rt);

        console.log('Displaying option for', id,'(', option.name, ')');
    };

    var onOptionClicked = function(id) {
        currentId = id;
        client.getOption(id, function(result) {
            displayOption(id, result);
        });
    };

    for (var id in categories) {
        document.getElementById(id).onclick = onOptionClicked.bind(null, id);
    }

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

      $('#slider').on('slide', _.debounce(function (event, val) {
        client.setDistance(+val);
      }, 500));

      $('#slider').on('slide', function (event, val) {
        var distance = val.slice(0, -1);
        $('#distance').html(val.slice(0, -1));
      });

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


      setInterval(randomBoxes, 2500);

    });

});
