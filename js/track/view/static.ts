import Genoverse from './../../genoverse';
import TrackView from '../view';
import * as $ from 'jquery';

export default abstract class StaticView extends TrackView {

  constructor(genoverse: Genoverse, properties?: any) {
    super(genoverse, properties);
    this.featureMargin = { top: 0, right: 1, bottom: 0, left: 1 }
  }
  
  positionFeature(){
    $.noop
  }
    
  scaleFeatures(features) { return features }
  
  draw(features, featureContext, labelContext, scale) {
    for (var i = 0; i < features.length; i++) {
      this.drawFeature(features[i], featureContext, labelContext, scale);
    }
  }
}