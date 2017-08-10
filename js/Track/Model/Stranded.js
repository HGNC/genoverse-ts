import TrackModel from '../model';

export default class StrandedModel extends TrackModel {
  init(reset: any) {
    super.init(reset);
    if (!reset) {
      var otherTrack = this.prop('forwardTrack');

      if (otherTrack) {
        this.featuresByChr = otherTrack.prop('featuresByChr');
        this.features      = otherTrack.prop('features');
        this.featuresById  = otherTrack.prop('featuresById');
      }
    }
  }

  parseURL() {
    if (!this.urlParams.strand) {
      this.urlParams.strand = this.prop('featureStrand');
    }

    return super.parseURL(arguments);
  }

  findFeatures() {
    const strand = this.track.featureStrand;
    return $.grep(
      super.findFeatures(arguments),
      function (feature: any) {
        return feature.strand === strand;
      }
    );
  }
}