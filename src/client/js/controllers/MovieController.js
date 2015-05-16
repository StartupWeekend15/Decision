/*globals define*/

define(['controllers/Controller', 
        'text!controllers/html/movie.html',
        'lodash'], function(Controller, 
                            movieHtml,
                            _) {
    'use strict';

    var movieTemplate = _.template(movieHtml);
    var MovieController = function() {
        Controller.apply(this, arguments);
    };

    _.extend(MovieController.prototype, Controller.prototype);

    // Override methods as needed
    MovieController.prototype.renderOption = function(option) {
        console.log('Movie option is', option);
        // Add the rating

        // Show the basic movie info
        this.container.html(movieTemplate(option));
        // Add click listener
        document.getElementById('nextBtn').onclick = this.renderNext.bind(this);
        this._updateView(option); // Using OMDB API
    };

    /**
     * Get the movie info from OMDB
     *
     * @param {String} movie
     * @return {undefined}
     */
    MovieController.prototype._getMovieInfo = function(movie, cb) {
        $.get('http://www.omdbapi.com/?t='+encodeURI(movie)+
                '&y=&plot=short&r=json', cb);
    };

    MovieController.prototype._updateView = function(option) {
        // Update the html with the new content
        this._getMovieInfo(option.title, function(movie) {
            if (movie.Poster && movie.Poster.indexOf('http') === 0) {
                document.getElementById('poster').innerHTML = '<img src='+
                    movie.Poster+' class="img-responsive"/>';
            }

            if (movie.imdbRating && parseInt(movie.imdbRating)) {
                document.getElementById('rating').innerHTML = this._createRatingText(movie.imdbRating/2);
            }
        }.bind(this));
    };

    return MovieController;
});
