import Genoverse from './../../genoverse';
import TrackModel from './../model';
import {GeneModelPropeties} from './../../interfaces/gene';

export default abstract class GeneModel extends TrackModel {
  constructor(genoverse: Genoverse, properties: GeneModelPropeties){
    super(genoverse, properties);
  }

  parseData(data: any[], chr: string): void {
    for (let i = 0; i < data.length; i++) {
      const feature = data[i];

      if (feature.feature_type === 'gene' && !this.featuresById[feature.id]) {
        feature.chr         = feature.chr || chr;
        feature.label       = parseInt(feature.strand, 10) === 1 ? (feature.external_name || feature.id) + ' >' : '< ' + (feature.external_name || feature.id);
        feature.transcripts = [];

        this.insertFeature(feature);
      }
    }
  }
}