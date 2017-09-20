var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var autoprefixer = require('gulp-autoprefixer');

var SOURCEPATHS = {
  sassSource : 'src/scss/*.scss',
  htmlSource : 'src/*.html'
}
var APPPATH = {
  root : 'app/',
  css : 'app/css',
  js : 'app/js'
}



// makes sass work
gulp.task('sass', function() {
    return gulp.src(SOURCEPATHS.sassSource)
      .pipe(autoprefixer())
      //1 autoprefixer adds -webkit-transition to the css
      .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
      //2 sass compiles .scss down to .css.
      //options: expanded, nested, compressed, compact
      .pipe(gulp.dest(APPPATH.css));
      //3 dest gives destination to write the css
});

gulp.task('copy', function() {
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
gulp.task('watch', ['serve', 'sass', 'copy'], function() {
  gulp.watch([SOURCEPATHS.sassSource], ['sass']);
  gulp.watch([SOURCEPATHS.htmlSource], ['copy'])
});

// this is the default gulp task
gulp.task('default', ['watch']);
