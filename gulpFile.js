var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var connect = require('gulp-connect');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var svgSprite = require('gulp-svg-sprites');
var gutil = require('gulp-util');
var sass = require('gulp-sass');


function compile(watch) {
  var bundler = watchify(browserify('./src/main.js', { debug: true }).transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', function(e) {
        gutil.log(gutil.colors.red('========= ERROR JS ========'));
        gutil.log(e.toString());
        this.emit('end');
      })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build'))
      .pipe(connect.reload())
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('bundling...');
      rebundle()
    });
  }

  rebundle()
}

function watch() {
  gulp.watch('src/svg/**/*.svg', ['sprites']);
  gulp.watch('./src/*.scss', ['sass']);
  gulp.watch(['./app/*.html'], ['html']);
  return compile(true)
}

gulp.task('compile', function() { return compile() });
gulp.task('watch', function() { return watch() });
gulp.task('connect', function() {
  connect.server({ livereload: true })
});

gulp.task('sass', function() {
  return gulp.src('./src/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .on('error', function(e) {
      gutil.log(gutil.colors.red('========= ERROR SASS ========'));
      gutil.log(e.toString());
      this.emit('end');
    })
    .pipe(postcss([autoprefixer({
      browsers: ['> 5%', '> 2% in IR', 'ie >= 9']
    })]))
    .pipe(connect.reload())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./build'));
});

// generate sprite.svg file
gulp.task('sprites', function() {
  return gulp.src('./src/svg/*.svg')
    .pipe(svgSprite({
      mode: "symbols",
      svgId: "%f",
      svg: {
        symbols: "sprite.svg"
      },
    }))
    .on('error', function(e) {
      gutil.log(gutil.colors.red('========= ERROR SPRITE ========'));
      gutil.log(e.toString());
      this.emit('end');
    })
    .pipe(gulp.dest("./build"));
});

gulp.task('html', function () {
  gulp.src('./src/**/*.html')
    .pipe(connect.reload())
});


gulp.task('default', ['watch', 'connect', 'sass', 'sprites']);
gulp.task('build', ['compile', 'sass', 'sprites']);
