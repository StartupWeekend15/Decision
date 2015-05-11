'use strict';

var google_places = require('googleplaces'),
    R = require('ramda'),
    Utils = require('../Utils'),
    path = require('path'),

    // Offline mode
    options = require('../../../test/assets/options'),
    _ = require('lodash');

var CATEGORIES = ['accounting','airport','amusement_park','aquarium','art_gallery','atm','bakery','bank','bar','beauty_salon','bicycle_store','book_store','bowling_alley','bus_station','cafe','campground','car_dealer','car_rental','car_repair','car_wash','casino','cemetery','church','city_hall','clothing_store','convenience_store','courthouse','dentist','department_store','doctor','electrician','electronics_store','embassy','establishment','finance','fire_station','florist','food','funeral_home','furniture_store','gas_station','general_contractor','grocery_or_supermarket','gym','hair_care','hardware_store','health','hindu_temple','home_goods_store','hospital','insurance_agency','jewelry_store','laundry','lawyer','library','liquor_store','local_government_office','locksmith','lodging','meal_delivery','meal_takeaway','mosque','movie_rental','movie_theater','moving_company','museum','night_club','painter','park','parking','pet_store','pharmacy','physiotherapist','place_of_worship','plumber','police','post_office','real_estate_agency','restaurant','roofing_contractor','rv_park','school','shoe_store','shopping_mall','spa','stadium','storage','store','subway_station','synagogue','taxi_stand','train_station','travel_agency','university','veterinary_care','zoo'];

var GoogleRequestor = function() {

    this._googlePlaces = new google_places(process.env.GOOGLE_PLACES_API_KEY, 'json');

    // Set to offline mode if necessary
    if (process.env.NODE_ENV === 'offline') {
        this.request = this._offlineRequest.bind(this);
    }
};

GoogleRequestor.prototype.getName = function() {
    return 'GoogleRequestor';
};
GoogleRequestor.prototype.request = function(params, callback) {
    params.types = params.types.join('|');
    return this._googlePlaces.placeSearch(params, R.partialRight(this.cleanResults.bind(this), callback));
};

/**
 * Clean the results received from Google Places API.
 *
 * @param {Error} err
 * @param {Object} response
 * @param {Function} callback
 * @return {Array<Places>}
 */
GoogleRequestor.prototype.cleanResults = function(err, response, callback) {
    if (err) {
        return callback(err);
    }

    var results = response.results.map(this.convertResult);
    results = Utils.filterClosed(results);
    callback(null, results);
};

/**
 * Convert a single request
 *
 * vicinity = simplified address (pass directly to google maps on client side)
 * location = contains the geocoded latitude,longitude value for this place.
 * formatted_phone_number = phone number locally formatted
 * rating = place rating
 * price_level = number 0 to 4 representing price
 * website = lists the authoritative website for this place, such as a business' homepage
 *
 * @param result
 * @return {undefined}
 */
GoogleRequestor.prototype.convertResult = function(result) {
    var fields = ['place_id', 'photos', 'name', 'icon', 'vicinity', 'types', 'geometry', 'formatted_phone_number', 'rating', 'price_level', 'website'];
    var json_result = R.pick(fields, result);
    json_result.location = json_result.geometry.location;
    var type = json_result.types[0];
    try {
        type = path.basename(json_result.icon.split('-')[0]);
        var words = type.split('_');
        type = '';
        for (var i=0; i<words.length; i++) {  // TODO: Refactor
            words[i] = words[i].charAt(0).toUpperCase() + words[i].substr(1) + ' ';
        }
        type = words.join(' ');
        // type = words.map(_.capitalize).join('  ');

    } catch(error) { console.log("parsing icon didn't work", json_result.icon); }
    json_result.type = type;
    delete json_result.geometry;
    return json_result;
};

GoogleRequestor.prototype.getCategories = function() {
    return CATEGORIES.slice();
};

// Offline mode
GoogleRequestor.prototype._offlineRequest = function(params, callback) {
    console.log('params are', params);
    // Filter by the categories
    var categoryFilter = Utils.hasCategory.bind(null, params.types),
        results = options.filter(categoryFilter);
    return this.cleanResults(null, {results: results}, callback);
};

module.exports = GoogleRequestor;
