import Genoverse from './../../../genoverse';
import StaticModel from '../static';

export default class LegendModel extends StaticModel {
  type: any;
  width: number;

  constructor(genoverse: Genoverse, properties: any) {
    super(genoverse);
    $.extend(this, properties);
  }
  
  findFeatures () {
    var bounds   = { x: this.browser.scaledStart, y: 0, w: this.width, h: 0 };
    var features = {};

    for (let index = 0; index < this.browser.tracks.length; index++) {
      const track = this.browser.tracks[index];
      
      if (track.legendType === this.type){
        
        const featurePositions = track.featurePositions;
        bounds.h = track.height;
        if(featurePositions){
          
          let feats = featurePositions.search(bounds).concat(track.labelPositions.search(bounds));
          for (let j = 0; j < feats.length; j++) {
            const feat = feats[j];
            if (feat.legend) {
              features[feat.legend] = feat.legendColor || feat.color;
            }
          }
        }
        
      }
    }
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