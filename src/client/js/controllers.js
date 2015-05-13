/*globals define*/
define([
    './controllers/Controller',
    './controllers/MovieController'
], function(
    Controller,
    MovieController
) {
    'use strict';
    return {
        Controller: Controller,
        MovieController: MovieController
    };
});
