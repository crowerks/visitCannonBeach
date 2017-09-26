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


//Set ths sources for backend development
var SOURCEPATHS = {
  sassSource : 'src/scss/*.scss',
  htmlSource : 'src/*.html',
  jsSource : 'src/js/**',
  imgSource : 'src/img/**'
}

//Set the sources for the frontend display
var APPPATH = {
  root : 'app/',
  css : 'app/css',
  js : 'app/js',
  fonts : 'app/fonts',
  img: 'app/img'
}

//this keeps html in src and app synced
gulp.task('clean-html', function() {
  return gulp.src(APPPATH.root + '/*.html', {read: false, force: true})
    .pipe(clean());
});

//this keeps scripts in src and app synced
gulp.task('clean-scripts', function() {
  return gulp.src(APPPATH.js + '/*.js', {read: false, force: true})
    .pipe(clean());
});

// makes sass work
gulp.task('sass', function() {
    var bootstrapCSS = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.css');
    var sassFiles;

    sassFiles = gulp.src(SOURCEPATHS.sassSource)
      .pipe(autoprefixer())
      //1 autoprefixer adds -webkit-transition to the css
      .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
      //2 sass compiles .scss down to .css.
      //options: expanded, nested, compressed, compact

      //this merges the css together. Order dictates the css output
      return merge(bootstrapCSS, sassFiles)
      .pipe(concat('app.css'))
      .pipe(gulp.dest(APPPATH.css));
      //3 dest gives destination to write the css
});

gulp.task('images', function() {
  return gulp.src(SOURCEPATHS.imgSource)
    //checks if image is newer
    .pipe(newer(APPPATH.img))
    .pipe(imagemin())
    .pipe(gulp.dest(APPPATH.img));
});

//move fonts from dependency to app
gulp.task('moveFonts', function() {
  gulp.src('./node_modules/bootstrap/fonts/*.{eot,svg,ttf,woff,woff2}')
  .pipe(gulp.dest(APPPATH.fonts));
});

//compiles everything to main.js in app
gulp.task('scripts', ['clean-scripts'], function() {
  gulp.src(SOURCEPATHS.jsSource)
  .pipe(concat('main.js'))
  .pipe(browserify())
  .pipe(gulp.dest(APPPATH.js))
});

//creates html files in app
gulp.task('copy', ['clean-html'], function() {
  gulp.src(SOURCEPATHS.htmlSource)
    .pipe(gulp.dest(APPPATH.root))
});

// serve creates the local server with browserSync running
gulp.task('serve', ['sass'], function() {
  browserSync.init([APPPATH.css + '/*.css', APPPATH.root + '/*.html', APPPATH.js + '*.js'], {
    server : {
      baseDir : APPPATH.root
    }
  })
});

//gulp watch makes changes once the sass has been updated
gulp.task('watch', ['serve', 'sass', 'copy', 'clean-html', 'clean-scripts', 'scripts', 'moveFonts', 'images'], function() {
  gulp.watch([SOURCEPATHS.sassSource], ['sass']);
  gulp.watch([SOURCEPATHS.htmlSource], ['copy']);
  gulp.watch([SOURCEPATHS.jsSource], ['scripts']);
});

// this is the default gulp task
gulp.task('default', ['watch']);
