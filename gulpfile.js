
////////////////////////////////
		//Setup//
////////////////////////////////

// Plugins
var gulp = require('gulp'),
      pjson = require('./package.json'),
      sass = require('gulp-sass'),
      autoprefixer = require('gulp-autoprefixer'),
      cssnano = require('gulp-cssnano'),
      concat = require('gulp-concat'),
      rename = require('gulp-rename'),
      plumber = require('gulp-plumber'),
      uglify = require('gulp-uglify'),
      imagemin = require('gulp-imagemin'),
      browserSync = require('browser-sync').create(),
      reload = browserSync.reload;


// Relative paths function
var pathsConfig = function (appName) {
  this.app = "./" + (appName || pjson.name);
  var vendorsRoot = 'node_modules/';

  return {
    
    bootstrapSass: vendorsRoot + '/bootstrap/scss',
    vendorsJs: [
      vendorsRoot + 'jquery/dist/jquery.slim.js',
      vendorsRoot + 'popper.js/dist/umd/popper.js',
      vendorsRoot + 'bootstrap/dist/js/bootstrap.js',

    ],
    
    app: this.app,
    templates: this.app + '/templates',
    css: this.app + '/static/css',
    sass: this.app + '/static/sass',
    fonts: this.app + '/static/fonts',
    images: this.app + '/static/images',
    js: this.app + '/static/js'
  }
};

var paths = pathsConfig();

////////////////////////////////
		//Tasks//
////////////////////////////////

// Styles autoprefixing and minification
gulp.task('styles', function() {
  return gulp.src(paths.sass + '/project.scss')
    .pipe(sass({
      includePaths: [
        
        paths.bootstrapSass,
        
        paths.sass
      ]
    }).on('error', sass.logError))
    .pipe(plumber()) // Checks for errors
    .pipe(autoprefixer({browsers: ['last 2 versions']})) // Adds vendor prefixes
    .pipe(gulp.dest(paths.css))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cssnano()) // Minifies the result
    .pipe(gulp.dest(paths.css));
});

// Javascript minification
gulp.task('scripts', function() {
  return gulp.src(paths.js + '/project.js')
    .pipe(plumber()) // Checks for errors
    .pipe(uglify()) // Minifies the js
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.js));
});



// Vendor Javascript minification
gulp.task('vendor-scripts', function() {
  return gulp.src(paths.vendorsJs)
    .pipe(concat('vendors.js'))
    .pipe(gulp.dest(paths.js))
    .pipe(plumber()) // Checks for errors
    .pipe(uglify()) // Minifies the js
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.js));
});


// Image compression
gulp.task('imgCompression', function(){
  return gulp.src(paths.images + '/*')
    .pipe(imagemin()) // Compresses PNG, JPEG, GIF and SVG images
    .pipe(gulp.dest(paths.images))
});


// Browser sync server for live reload
gulp.task('browserSync', function() {
    browserSync.init(
      [paths.css + "/*.css", paths.js + "*.js", paths.templates + '*.html'], {
        proxy:  "localhost:8000"
    });
});

// Watch
gulp.task('watch', function() {
    gulp.watch(paths.sass + '/*.scss', gulp.series('styles'));
    gulp.watch(paths.js + '/*.js', gulp.series('scripts')).on("change", reload);
    gulp.watch(paths.images + '/*', gulp.series('imgCompression'));
    gulp.watch(paths.templates + '/**/*.html').on("change", reload);
});

// Default task
gulp.task('default',
    gulp.series(gulp.parallel('styles', 'scripts', 'vendor-scripts', 'imgCompression'), gulp.parallel('browserSync', 'watch'))
);
