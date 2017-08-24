import TrackModel from './../model';
import EnsemblSequenceModel from './sequence/ensembl';


export default class SequenceVariationModel extends TrackModel {
  
  seqModel = EnsemblSequenceModel;
  
  getSeqModel() {
    const models = this.prop('models');
    return models.seq = models.seq || this.track.newMVC(this.seqModel);
  }

  getData(chr: string, start: number, end: number): JQuery.Deferred<any, any, any> {
    var deferred = $.Deferred();
    var seqData  = this.getSeqModel().checkDataRange(chr, start, end);

    super.getData(chr, start, end).done(() => {
      if (seqData) {
        deferred.resolve();
      } else {
        this.getSeqModel().getData(chr, start, end).done(deferred.resolve);
      }
    });

    return deferred;
  }

  insertFeature(feature: any): void {
    return super.insertFeature($.extend(feature, {
      end      : feature.start + feature.alt_allele.length - 1,
      length   : feature.alt_allele.length,
      sequence : feature.alt_allele
    }));
  }

  checkDataRange(chr: string, start: number, end: number) {
    return super.checkDataRange(chr, start, end) && this.getSeqModel().checkDataRange(chr, start, end);
  }

  findFeatures(chr: string, start: number, end: number) {
    return this.getSeqModel().findFeatures(chr, start, end).concat(super.findFeatures(chr, start, end));
  }
}