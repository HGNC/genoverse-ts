import Genoverse from './../../../genoverse';
import StaticModel from '../static';

export default class LegendModel extends StaticModel {
  constructor(genoverse: Genoverse, properties: any){
    super(genoverse);
    $.extend(this, properties);
  }
  
  findFeatures () {
    var bounds   = { x: this.browser.scaledStart, y: 0, w: this.width, h: 0 };
    var features = {};
    $.each($.map(this.browser.tracks, function (track) {
      const featurePositions = track.featurePositions;
      bounds.h = track.height;
      return featurePositions ? featurePositions.search(bounds).concat(track.labelPositions.search(bounds)) : [];

    }), function () {
      if (this.legend) {
        features[this.legend] = this.legendColor || this.color;
      }
    });
    
    return this.sortFeatures($.map(features, function (color, text) { return [[ text, color ]]; }));
  }

  sortFeatures(features) {
    // sort legend alphabetically
    return features.sort(function (a, b) {
      var x = a[0].toLowerCase();
      var y = b[0].toLowerCase();
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }
}