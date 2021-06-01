// Less configuration
var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('less', function(cb) {
  gulp
    .src('less/agone.less')
    .pipe(less())
    .pipe(
      gulp.dest("./css/")
    );
  cb();
});

gulp.task(
  'default',
  gulp.series('less', function(cb) {
    gulp.watch('less/*.less', gulp.series('less'));
    cb();
  })
);