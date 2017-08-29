import Track from './../../track';

export default abstract class SequenceController extends Track {
  getClickedFeatures(x: any, y: any) {
    var feature = super.getClickedFeatures(x, y)[0];

    return feature ? this.makeSeqFeatureMenu(feature, Math.floor(x / this.scale)) : false;
  }

  makeSeqFeatureMenu(feature: any, pos: any) {
    feature.featureMenus      = feature.featureMenus      || {};
    feature.featureMenus[pos] = feature.featureMenus[pos] || {
      title    : feature.sequence.charAt(pos - feature.start),
      Location : feature.chr + ':' + pos
    }
    return feature.featureMenus[pos].title ? feature.featureMenus[pos] : undefined;
  }
}