import FileModel from '../file';
import {Utils, BamFile} from 'bam';

export default class BAMModel extends FileModel {
  indexFile: any;
  baiFile: any;
  bamFile: any;

  getData(chr: string, start: number, end: number) {
    const model    = this;
    const deferred = $.Deferred();

    if (!this.bamFile) {
      if (this.url) {
        this.bamFile = Utils.urlFetchableFactory(this.url);
        this.baiFile = Utils.urlFetchableFactory(this.url + this.prop('indexExt'));
      } else if (this.dataFile && this.indexFile) {
        this.bamFile = Utils.blobFetchableFactory(this.dataFile);
        this.baiFile = Utils.blobFetchableFactory(this.indexFile);
      }
    }

    BamFile.factory(this.bamFile, this.baiFile, function (bam: any, makeBamError: any) {
      if (makeBamError) {
        console.error(makeBamError);
      } else {
        bam.fetch(chr, start, end, function (features: any, fetchBamError: any) {
          if (fetchBamError) {
            console.error(fetchBamError);
          } else {
            model.receiveData(features, chr, start, end);
            deferred.resolveWith(model);
          }
        });
      }
    });
    return deferred;
  }

  insertFeature(feature: any) {
    feature.id       = feature.chr + ':' + feature.readName + ':' + feature.pos;
    feature.start    = feature.pos + 1;
    feature.end      = feature.start + feature.seq.length;
    feature.sequence = feature.seq;

    return super.insertFeature(feature);
  }
}