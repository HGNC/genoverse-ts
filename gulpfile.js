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
  return gulp.src('tsDist', {
      read: false
    })
    .pipe(clean());
});

gulp.task('copy-fonts', function () {
  return gulp.src([
      './fonts/**/*'
    ])
    .pipe(gulp.dest('./tsDist/fonts'));
});

gulp.task('copy-images', function () {
  return gulp.src([
      './i/**/*'
    ])
    .pipe(gulp.dest('./tsDist/i'));
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
    .pipe(gulp.dest('./tsDist/css'));
});

gulp.task("ts", ["copy-html", "build-css", "copy-fonts", "copy-images"], function () {
  return browserify('js/global.ts')
    .plugin(tsify, {
      noImplicitAny: false,
      "target": "es5",
      "lib" : ["es2015", "es2015.iterable", "dom"],
      "typeRoots" : [
        "node_modules/@types",
        "js/lib/@types"
      ]
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest("tsDist"));
});

gulp.task("copy-html", function () {
  return gulp.src(paths.pages)
    .pipe(gulp.dest("tsDist"));
});

gulp.task('serve-ts', function () {
  browserSync.init({
    server: {
      baseDir: "./tsDist"
    }
  });
});