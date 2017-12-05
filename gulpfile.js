var gulp = require('gulp');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var streamqueue = require('streamqueue');
var runSequence = require('run-sequence');

var babelify = require('babelify'),
  browserify = require('browserify'),
  buffer = require('vinyl-buffer'),
  gutil = require('gulp-util'),
  rename = require('gulp-rename'),
  source = require('vinyl-source-stream'),
  sourceMaps = require('gulp-sourcemaps'),
  browserSync = require('browser-sync').create();

var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var tsify = require("tsify");
var paths = {
  pages: ['*.html']
};


gulp.task('clean', function () {
  return gulp.src('dist', {
      read: false
    })
    .pipe(clean());
});

gulp.task('copy-fonts', function () {
  return gulp.src([
      './fonts/**/*'
    ])
    .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('copy-images', function () {
  return gulp.src([
      './i/**/*'
    ])
    .pipe(gulp.dest('./dist/i'));
});

gulp.task('build-css', function () {
  return streamqueue({
        objectMode: true
      },
      gulp.src('./css/font-awesome.css'),
      gulp.src('./css/genoverse.css'),
      gulp.src('./css/controlPanel.css'),
      gulp.src('./css/karyotype.css'),
      gulp.src('./css/trackControls.css'),
      gulp.src('./css/resizer.css'),
      gulp.src('./css/fullscreen.css'),
      gulp.src('./css/tooltips.css')
    )
    .pipe(concat('genoverse.css'))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task("copy-html", function () {
  return gulp.src(paths.pages)
    .pipe(gulp.dest("dist"));
});

gulp.task("ts", function () {
  return browserify({
    basedir: '.',
    debug: true,
    entries: ['js/global.ts'],
    cache: {},
    packageCache: {}
  })
    .plugin(tsify)
    .bundle()
    .pipe(source('index.js'))
    .pipe(gulp.dest("dist"));
});

gulp.task("build", gulp.parallel("copy-html", "build-css", "copy-fonts", "copy-images", "ts"));

gulp.task('serve', function () {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
});

gulp.task('default', gulp.series('build'));
