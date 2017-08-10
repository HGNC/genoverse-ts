import Genoverse from  '../genoverse';
import * as $ from 'jquery';

function create() {
  this.on('afterInit', function () {
    var browser = this;
    var wrapper = this.wrapper;

    $(window).on('dragenter', function (e: JQuery.Event<HTMLElement, null>) {
      var dataTransfer = (<any>e.originalEvent).dataTransfer;

      if (dataTransfer && dataTransfer.types && (dataTransfer.types[0] === 'Files' || dataTransfer.types[1] === 'Files' || dataTransfer.types[2] === 'Files') && !$('.gv-file-drop-total-overlay').length) {
        var fileDropDiv      = $('<div class="gv-file-drop">').appendTo(wrapper);
        var totalDropOverlay = $('<div class="gv-file-drop-total-overlay">').prependTo('body');

        var dragleave = function () {
          fileDropDiv.remove();
          totalDropOverlay.remove();
        };

        totalDropOverlay.on('dragenter', function (e: JQuery.Event<HTMLElement, null>) { e.preventDefault(); e.stopPropagation(); });
        totalDropOverlay.on('dragover',  function (e: JQuery.Event<HTMLElement, null>) { e.preventDefault(); e.stopPropagation(); });
        totalDropOverlay.on('dragleave', dragleave);
        totalDropOverlay.on('drop', function (e: JQuery.Event<HTMLElement, null>) {
          dragleave();
          e.preventDefault();
          e.stopPropagation();

          // Sort in order to ensure that .bam files are before their .bam.bai files
          var files = $.map((<any>e.originalEvent).dataTransfer.files, function (f) { return f; }).sort(function (a, b) { return a.name < b.name ? -1 : 1 });

          for (var i = 0; i < files.length; i++) {
            var file  = files[i];
            var ext   = (file.name.match(/\.(\w+)$/))[1];


            var track = Genoverse.TrackFile[ext.toUpperCase()];
            var indexFile;

            if (typeof track === 'undefined') {
              return;
            }

            if (track.prototype.indexExt) {
              i++;

              if ((files[i] || {}).name !== file.name + track.prototype.indexExt) {
                continue;
              }

              indexFile = files[i];
            }

            track = track.extend({
              name      : file.name,
              info      : 'Local file `' + file.name + '`, size: ' + file.size + ' bytes',
              isLocal   : true,
              dataFile  : file,
              indexFile : indexFile
            });

            browser.addTrack(track, browser.tracks.length - 1);
          }

          return false;
        });
        
      }
    });
  });
};

const fileDrop = {
  create: create
};

export default fileDrop;