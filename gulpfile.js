var gulp = require('gulp');
var less = require('gulp-less');
var cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var minify = require('gulp-minify'); //using @es5 version
var rename = require('gulp-rename');
var chalk = require('chalk');
var path = require('path');

gulp.task('compress-merge-less', function() {
  return gulp.src( ['./public/.src/less/index.less'], {base: './public/.src/less/'} )
    .pipe( sourcemaps.init() )
    .pipe( less() )
    .pipe( cleanCSS( {compatibility: 'ie8'} ) )
    .pipe( rename( "styles.css" ) )
    .pipe( sourcemaps.write('../maps/') )
    .pipe( gulp.dest('./public/css/') )
});

gulp.task('js', function() {
  // return gulp.src('./public/.src/js/*.js')
  //   .pipe( minify({
  //     ext: {
  //       src: '-debug.js',
  //       min: '.js'
  //     },
  //   }) )
  //   .pipe( gulp.dest('./public/js/'))
});

gulp.task('default', ['compress-merge-less', 'js'], function() {
  gulp.watch('./public/.src/less/**/*.less', ['compress-merge-less']);
});