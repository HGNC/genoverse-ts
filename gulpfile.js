var gulp         = require('gulp');
var clean        = require('gulp-clean');
var concat       = require('gulp-concat');
var uglify       = require('gulp-uglify');
var streamqueue  = require('streamqueue');
var runSequence   = require('run-sequence');

gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('clean', function () {
  return gulp.src('dist', {read: false})
    .pipe(clean());
});

gulp.task('copy-fonts', function() {
  return gulp.src([
    './fonts/**/*'
  ])
  .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('copy-images', function() {
  return gulp.src([
    './i/**/*'
  ])
  .pipe(gulp.dest('./dist/i'));
});

gulp.task('build-css', function() {
  return streamqueue(
    { objectMode: true },
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

gulp.task('build-js', function() {
  return streamqueue(
    { objectMode: true },
    gulp.src('./js/lib/jquery.js'),
    gulp.src('./js/lib/jquery-ui.js'),
    gulp.src('./js/lib/jquery.mousewheel.js'),
    gulp.src('./js/lib/jquery.mousehold.js'),
    gulp.src('./js/lib/jquery.tipsy.js'),
    gulp.src('./js/lib/Base.js'),
    gulp.src('./js/lib/rtree.js'),
    gulp.src('./js/lib/dalliance-lib.min.js'),
    gulp.src('./js/Genoverse.js'),
    gulp.src('./js/Track.js'),
    gulp.src('./js/Track/Controller.js'),
    gulp.src('./js/Track/Model.js'),
    gulp.src('./js/Track/View.js'),
    gulp.src('./js/Track/library/LineGraph.js'),
    gulp.src('./js/Track/library/Static.js'),
    gulp.src('./js/Track/Controller/Stranded.js'),
    gulp.src('./js/Track/Model/Stranded.js'),
    gulp.src('./js/Track/Controller/Sequence.js'),
    gulp.src('./js/Track/Model/Sequence.js'),
    gulp.src('./js/Track/Model/Sequence/Fasta.js'),
    gulp.src('./js/Track/Model/Sequence/Ensembl.js'),
    gulp.src('./js/Track/View/Sequence.js'),
    gulp.src('./js/Track/View/Sequence/Variation.js'),
    gulp.src('./js/Track/Model/SequenceVariation.js'),
    gulp.src('./js/Track/Model/Gene.js'),
    gulp.src('./js/Track/Model/Gene/Ensembl.js'),
    gulp.src('./js/Track/Model/Gene/HGNCEnsembl.js'),
    gulp.src('./js/Track/Model/Gene/HGNCVega.js'),
    gulp.src('./js/Track/Model/Gene/HGNCNCBIGene.js'),
    gulp.src('./js/Track/Model/Gene/HGNCPseudogeneOrg.js'),
    gulp.src('./js/Track/View/Gene.js'),
    gulp.src('./js/Track/View/Gene/Ensembl.js'),
    gulp.src('./js/Track/View/Gene/HGNCEnsembl.js'),
    gulp.src('./js/Track/View/Gene/HGNCVega.js'),
    gulp.src('./js/Track/View/Gene/HGNCNCBIGene.js'),
    gulp.src('./js/Track/View/Gene/HGNCPseudogeneOrg.js'),
    gulp.src('./js/Track/Model/Transcript.js'),
    gulp.src('./js/Track/Model/Transcript/Ensembl.js'),
    gulp.src('./js/Track/Model/Transcript/GFF3.js'),
    gulp.src('./js/Track/View/Transcript.js'),
    gulp.src('./js/Track/View/Transcript/Ensembl.js'),
    gulp.src('./js/Track/Model/File.js'),
    gulp.src('./js/Track/Model/File/BAM.js'),
    gulp.src('./js/Track/Model/File/BED.js'),
    gulp.src('./js/Track/Model/File/GFF.js'),
    gulp.src('./js/Track/Model/File/VCF.js'),
    gulp.src('./js/Track/library/Chromosome.js'),
    gulp.src('./js/Track/library/dbSNP.js'),
    gulp.src('./js/Track/library/File.js'),
    gulp.src('./js/Track/library/File/BAM.js'),
    gulp.src('./js/Track/library/File/BED.js'),
    gulp.src('./js/Track/library/File/GFF.js'),
    gulp.src('./js/Track/library/File/GFF3.js'),
    gulp.src('./js/Track/library/File/VCF.js'),
    gulp.src('./js/Track/library/Gene.js'),
    gulp.src('./js/Track/library/HGNCEnsembl.js'),
    gulp.src('./js/Track/library/HGNCVega.js'),
    gulp.src('./js/Track/library/HGNCNCBIGene.js'),
    gulp.src('./js/Track/library/HGNCPseudogeneOrg.js'),
    gulp.src('./js/Track/library/HighlightRegion.js'),
    gulp.src('./js/Track/library/Legend.js'),
    gulp.src('./js/Track/library/Scaleline.js'),
    gulp.src('./js/Track/library/Scalebar.js')
  )
  .pipe(concat('genoverse-hgnc.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('./dist/js'));
});


gulp.task('build', function(){
  runSequence(
    'clean',
    ['build-js', 'build-css', 'copy-fonts', 'copy-images']
  );
});