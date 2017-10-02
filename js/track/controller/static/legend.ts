import Genoverse from './../../../genoverse';
import StaticTrack from "./../static";
import LegendModel from "./../../model/static/legend";
import LegendView from "./../../view/static/legend";
import * as $ from 'jquery';


export default class LegendTrack extends StaticTrack {
  tracks: any[];
  type: any;
  order: any;
  removable: boolean;
  lockToTrack: boolean;
  
  constructor(genoverse: Genoverse, properties: any){
    super(genoverse, properties);
    this.unsortable = true;
    this.lockToTrack = true; // Always put the legend just below the last track that the legend is for
    this.removable = false;
    this.init();
  }
  
  init(): void {
    this.model = this.createModel();
    this.setEvents();
    this.setDefaults();
    this.addDomElements();
    this.addUserEventHandlers();
    this.deferreds = [];
    this.container.addClass('gv-track-container-legend');
    this.browser.legends[this.id] = this;
    this.view = this.createView();
    this.setTracks();
  }

  setEvents() {
    this.browser.on({
      'afterAddTracks afterRemoveTracks': function (tracks) {
        for (var i in this.legends) {
          this.legends[i].setTracks();
        }

        this.sortTracks();
      },
      afterUpdateTrackOrder: function (e, ui) {
        var track       = ui.item.data('track');
        var legendTrack = this.legends[track.id] || track.legendTrack;

        // If a legend track, or a track with a sortable legend has been reordered, its lockToTrack status is ignored from now on.
        // This allows a legend to initially be locked to a track, but then to be reordered once the browser has been initialized
        if (legendTrack && legendTrack.lockToTrack && legendTrack.unsortable === false) {
          legendTrack.lockToTrack = false;
        }

        for (var i in this.legends) {
          this.legends[i].updateOrder();
        }

        this.sortTracks();
      }
    });

    this.browser.on({
      afterPositionFeatures: function (features, params) {
        const legend = this.legendTrack;

        if (legend) {
          setTimeout(function () { legend.controller.makeImage(params); }, 1);
        }
      },
      afterResize: function (height, userResize) {
        const legend = this.legendTrack;

        if (legend && userResize === true) {
          legend.controller.makeImage({});
        }
      },
      afterCheckHeight: function () {
        const legend = this.legendTrack;

        if (legend) {
          legend.controller.makeImage({});
        }
      },

      afterSetMVC: function () {
        const legend = this.legendTrack;

        if (legend && legend.tracks.length) {
          legend.disable();

          if (this.legend !== false) {
            legend.enable();
          }
        }
      }
    }, this);
  }

  setTracks() {
    const legend = this;
    const type   = this.type;
    this.tracks = $.grep(this.browser.tracks, function (t) {
      if (t.legendType === type && !t.disabled) {
        t.legendTrack = t.legendTrack || legend;
        return true;
      }
    });

    this.tracks = this.tracks.concat($.map(this.tracks, function (t) {
      const linkedTrack = t.subtrack || t.parentTrack;
      return linkedTrack && linkedTrack.disabled !== true ? linkedTrack : null;
    }));

    this.updateOrder();
    this[this.tracks.length ? 'enable' : 'disable']();
    
  }

  updateOrder() {
    const tracks = this.tracks.filter(function (t) { return !t.parentTrack; });

    if (tracks.length && this.lockToTrack) {
      this.order = tracks[tracks.length - 1].order + 0.1;
    }
  }

  enable() {
    super.enable();
    this.makeImage({});
  }

  disable() {
    delete this.stringified;
    super.disable();
  }
  
  createModel() {
    return new LegendModel(this.browser, {width: this.width});
  }
  
  createView(properties?: Object) {
    return new LegendView(this.browser, {
      featureHeight: 20,
      width: this.width,
      margin: this.margin,
    });
  }

  destroy() {
    delete this.browser.legends[this.id];
    super.destroy();
  }
  
  setDefaults() {
    this.order = typeof this.order !== 'undefined' ? this.order : 9e99;
    this.id    = this.id   || 'legend';
    this.type  = this.type || 'legend';
    super.setDefaults();
  }

  

}