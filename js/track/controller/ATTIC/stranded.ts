import Track from './../../track';
import Genoverse from '../../genoverse';

export default abstract class StrandedController extends Track {
  featureStrand: any;
  strand: any;
  removing: any;
  _deferredReverseTrackImages: any;
  _makeImage: any;
  reverseTrack?: StrandedController;
  forwardTrack?: StrandedController;
  orderReverse?: number;
  order?: any;

  constructor(genoverse: Genoverse, properties?: any) {
    super(genoverse, properties);
    if (typeof this._makeImage === 'function') {
      return;
    }

    let strand        = this.strand;
    const featureStrand = this.featureStrand;

    if (strand === -1) {
      if(typeof (<any>this).makeReverseImage === 'function') {
        this._makeImage = $.proxy((<any>this).makeReverseImage, this);
      } else {
        this._makeImage = this.makeImage;
        this.makeImage  = $.noop;
      }
    } else {
      strand = this.strand;

      this._makeImage = this.makeImage;
      this.makeImage  = this.makeForwardImage;

      var track = this;

      if(! properties || ! properties.isChild){
        setTimeout(() => {    
          track.reverseTrack = track.browser.addTrack(
            this.trackFactory(genoverse, {
              id           : track.id ? track.id + 'Reverse' : undefined,
              strand       : -1,
              url          : false,
              order        : typeof track.orderReverse === 'number' ? track.orderReverse : track.order,
              forwardTrack : track,
              isChild      : true
            })
          );
          $.each(track._deferredReverseTrackImages, function (i, args) { track._makeReverseTrackImage.apply(track, args); });
          delete track._deferredReverseTrackImages;
        }, 1);
      }

    }

    if (!featureStrand) {
      this.featureStrand = strand;
    }
  }

  abstract trackFactory(genoverse: Genoverse, properties?: any);

  makeForwardImage(params: any) {
    this._makeReverseTrackImage(params, this._makeImage(params));
  }

  _makeReverseTrackImage(params: any, deferred: any) {
    var reverseTrack = this.reverseTrack;

    if (!reverseTrack) {
      this._deferredReverseTrackImages = (this._deferredReverseTrackImages || []).concat([[ params, deferred ]]);
      return;
    }

    if (deferred && typeof deferred.done === 'function') {
      deferred.done(function () {
        reverseTrack._makeImage(params, deferred);
      });
    } else {
      reverseTrack._makeImage(params, deferred);
    }
  }

  destroy() {
    if (this.removing) {
      return;
    }

    this.removing = true;

    this.browser.removeTrack(this.forwardTrack || this.reverseTrack);
    super.destroy();
  }

}
