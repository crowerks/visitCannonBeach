// ↓ call all requirements
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var autoprefixer = require('gulp-autoprefixer');
var browserify =require('gulp-browserify');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var merge = require('merge-stream');
var newer = require('gulp-newer');
var imagemin = require('gulp-imagemin');
var minify = require('gulp-minify');
var rename = require('gulp-rename');
var cssmin = require('gulp-cssmin');
var htmlmin = require('gulp-htmlmin');


// ↓ Set ths sources for backend development: src
var SOURCEPATHS = {
  sassSource : 'src/scss/*.scss',
  htmlSource : 'src/*.html',
  jsSource : 'src/js/**',
  imgSource : 'src/img/**'
}

// ↓ Set the sources for the frontend display: app
var APPPATH = {
  root : 'app/',
  css : 'app/css',
  js : 'app/js',
  fonts : 'app/fonts',
  img: 'app/img'
}

// ↓ keeps html in src and app synced
gulp.task('clean-html', function() {
  return gulp.src(APPPATH.root + '/*.html', {read: false, force: true})
    .pipe(clean());
});

// ↓ keeps scripts in src and app synced
gulp.task('clean-scripts', function() {
  return gulp.src(APPPATH.js + '/*.js', {read: false, force: true})
    .pipe(clean());
});

// ↓ makes sass work
gulp.task('sass', function() {
    // ↓ pull in Bootstrap
    var bootstrapCSS = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.css');
    var sassFiles;

    sassFiles = gulp.src(SOURCEPATHS.sassSource)
      // ↓ autoprefixer adds -webkit-transition to the css
      .pipe(autoprefixer())
      // ↓ sass compiles .scss down to .css.
      //options: expanded, nested, compressed, compact
      .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
      // ↓ merges the css together. Order dictates the css output
      return merge(bootstrapCSS, sassFiles)
      // ↓ put it all into one css
      .pipe(concat('app.css'))
      // ↓ send to destination
      .pipe(gulp.dest(APPPATH.css));
});

//copy and minify images from src to app
gulp.task('images', function() {
  return gulp.src(SOURCEPATHS.imgSource)
    // ↓ checks if image is newer
    .pipe(newer(APPPATH.img))
    // ↓ minify image
    .pipe(imagemin())
    // ↓ send to destination
    .pipe(gulp.dest(APPPATH.img));
});

//copy fonts from src to app
gulp.task('copyFonts', function() {
  // ↓ pull fonts from source
  gulp.src('./node_modules/bootstrap/fonts/*.{eot,svg,ttf,woff,woff2}')
  // ↓ send to destination
  .pipe(gulp.dest(APPPATH.fonts));
});

//compiles everything to main.js in app
gulp.task('scripts', ['clean-scripts'], function() {
  gulp.src(SOURCEPATHS.jsSource)
  // ↓ smash into a single js
  .pipe(concat('main.js'))
  // ↓ run browserify / require
  .pipe(browserify())
  // ↓ send to destination
  .pipe(gulp.dest(APPPATH.js))
});

/**********************/
/** Production Tasks **/
/**********************/
// ↓ minify scripts in main.js
gulp.task('compress', function() {
  gulp.src(SOURCEPATHS.jsSource)
  // ↓ smash into a single js
  .pipe(concat('main.js'))
  // ↓ run browserify / require
  .pipe(browserify())
  // ↓ minify it
  .pipe(minify())
  // ↓ send to destination
  .pipe(gulp.dest(APPPATH.js))
});

// makes sass work
gulp.task('compresscss', function() {
    // ↓ pull in Bootstrap
    var bootstrapCSS = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.css');
    var sassFiles;

    sassFiles = gulp.src(SOURCEPATHS.sassSource)
      // ↓ autoprefixer adds -webkit-transition to the css
      .pipe(autoprefixer())
      // ↓ sass compiles .scss down to .css.
      //options: expanded, nested, compressed, compact
      .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
      // ↓ merges the css together. Order dictates the css output
      return merge(bootstrapCSS, sassFiles)
      // ↓ smash into one css
      .pipe(concat('app.css'))
      // ↓ minify css
      .pipe(cssmin())
      // ↓ rename it to have .min
      .pipe(rename({suffix: '.min'}))
      // ↓ send to destination
      .pipe(gulp.dest(APPPATH.css));
});
gulp.task('minifyHtml', function() {
  return gulp.src(SOURCEPATHS.htmlSource)
    // ↓ minify the HTML and collapse any extra whitespace
    .pipe(htmlmin({collapseWhitespace:true}))
    // ↓ send to destination
    .pipe(gulp.dest(APPPATH.root))
});
/*****************************/
/** End of Production Tasks **/
/*****************************/

// ↓ creates html files in app
gulp.task('copy', ['clean-html'], function() {
  gulp.src(SOURCEPATHS.htmlSource)
    // ↓ send to destination
    .pipe(gulp.dest(APPPATH.root))
});

// ↓ serve creates the local server with browserSync running
gulp.task('serve', ['sass'], function() {
  // ↓ run browserSync with css, html, js
  browserSync.init([APPPATH.css + '/*.css', APPPATH.root + '/*.html', APPPATH.js + '*.js'], {
    server : {
      baseDir : APPPATH.root
    }
  })
});

// ↓ gulp watch makes changes once the sass has been updated
gulp.task('watch', ['serve', 'sass', 'copy', 'clean-html', 'clean-scripts', 'scripts', 'copyFonts', 'images'], function() {
  gulp.watch([SOURCEPATHS.sassSource], ['sass']);
  gulp.watch([SOURCEPATHS.htmlSource], ['copy']);
  gulp.watch([SOURCEPATHS.jsSource], ['scripts']);
});

// ↓ the default gulp task
gulp.task('default', ['watch']);

// ↓ run this when ready to push live
gulp.task('production', ['minifyHtml', 'compresscss', 'compress']);
