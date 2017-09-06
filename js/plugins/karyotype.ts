import Genoverse from '../genoverse';
import ChromosomeTrack from './../track/controller/chromosome';
import * as $ from 'jquery';
import './../lib/jquery-tipsy';

function create() {
  function createKaryotype() {

    const chromosome = $('<div class="gv-chromosome">');
    const container: any  = $('<div class="gv-karyotype-container">').html(<any>chromosome).insertBefore(this.wrapper);
    this.karyotype = new Genoverse({
      parent    : this,
      container : chromosome,
      width     : chromosome.width(),
      genome    : this.genome,
      chr       : this.chr,
      start     : 1,
      end       : this.chromosomeSize,
      isStatic  : true,
      tracks    : [
        ChromosomeTrack
      ],

      addUserEventHandlers: $.noop,

      afterInit: function () {
        this.updatePosition();
        this.viewPoint.fadeIn();
      },

      //afterAddTracks: function () {
      //  this.track = this.tracks[0];
      //},

      afterAddDomElements: function () {
        const karyotype = this;
        const parent    = this.parent;

        function hideTooltip() {
          karyotype.hideTooltip = true;
          karyotype.track.container.tipsy('hide');
        }

        function updateLocation(e: Event, ui: any) {
          karyotype.hideTooltip = false;

          if (e.type === 'resizestop') {
            const axis = $(this).data('ui-resizable').axis;

            if ((axis === 'e' && parent.end === karyotype.chromosomeSize) || (axis === 'w' && parent.start === 1)) {
              return; // Don't change location if the position didn't change (dragging off the right or left edges)
            }
          }

          const scale = karyotype.chromosomeSize / karyotype.width;
          const start = Math.max(Math.floor(ui.position.left * scale), 1);
          const end   = e.type === 'dragstop' ? start + parent.length - 1 : Math.floor(ui.helper.outerWidth(true) * scale) + start;

          parent.moveTo(karyotype.chr, start, end, true, e.type === 'dragstop');
        }

        if (parent.karyotypeLabel === false) {
          this.labelContainer.remove();
          this.labelContainer = $();
          container.addClass('gv-no-label');
        }
        karyotype.track = karyotype.tracks[0];
        this.viewPoint = $('<div class="gv-karyotype-viewpoint-wrapper"><div class="gv-karyotype-viewpoint"></div></div>').appendTo(container).children().on({
          mousemove : (e: any) => { karyotype.track.click(e); },
          mouseout  : (e: any) => {
            var el = $(e.relatedTarget);

            if (karyotype.viewPoint.is(el) || karyotype.viewPoint.find(el).length || ((<any>el).nodeName === 'IMG' && el.parent().is(karyotype.track.imgContainers[0]))) {
              return true;
            }

            karyotype.track.container.tipsy('hide');
            karyotype.track.hoverFeature = false;
          }
        });

        if (!parent.isStatic) {
          this.viewPoint.draggable({
            axis        : 'x',
            containment : this.wrapper,
            start       : hideTooltip,
            stop        : updateLocation
          }).resizable({
            handles     : 'e, w',
            containment : 'parent',
            start       : hideTooltip,
            stop        : updateLocation,
            resize      : function (e: Event, ui: any) {
              ui.element.css('left', Math.max(0, ui.position.left));

              if (ui.position.left > 0) {
                ui.element.width(Math.min(ui.size.width, ui.element.parent().width() - ui.position.left));
              } else {
                ui.element.width(ui.size.width + ui.position.left);
              }
            }
          });
        }
      },

      updatePosition: function () {
        
        const left  =  this.parent.start * this.scale;
        const width = (this.parent.end   * this.scale) - left;

        this.viewPoint.css({ left: left, width: width });
      }
    }, 'karyotype');

    if (!this.loadedPlugins.controlPanel) {
      $('<li class="gv-unsortable">').height(function (i: number, h: number) {
        return h + container.height();
      }).prependTo(this.labelContainer);
    }
  }

  function recreateKaryotype() {
    const container = this.karyotype.container.parent();

    this.karyotype.destroy();
    container.remove();

    createKaryotype.call(this);
  }

  this.on({
    afterInit: createKaryotype,

    afterSetRange: function () {
      if (this.karyotype) {
        this.karyotype.updatePosition();
      }
    },

    afterSetWidth: recreateKaryotype,

    afterMoveTo: function (chr: string) {
      if (this.karyotype && this.karyotype.chr !== chr) {
        recreateKaryotype.call(this);
      }
    }
  });
};

const karyotype = {
  requires: ['controlPanel'],
  create: create
};

export default karyotype;