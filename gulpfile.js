var gulp = require('gulp');
var jade = require('gulp-jade');

gulp.task('default', function() {
  // place code for your default task here
  var watcher = gulp.watch('./src/client/result.jade');
  watcher.on('change', function() {
    gulp.src('./src/client/result.jade')
      .pipe(jade({
        pretty: true
      }))
      .pipe(gulp.dest('./src/client/html'));
  });
});
