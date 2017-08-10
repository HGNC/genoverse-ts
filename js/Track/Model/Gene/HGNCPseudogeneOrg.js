import GeneModel from './../gene';

export default class HGNCPseudogeneOrgModel extends GeneModel {
  
  dataRequestLimit = 5000000;

  parseData(data: any[]) {
    for (let i = 0; i < data.length; i++) {
      const feature = data[i];

      if (feature.feature_type === 'gene' && !this.featuresById[feature.id]) {
        feature.label       = parseInt(feature.strand, 10) === 1 ? feature.id + ' >' : '< ' + feature.id;
        feature.transcripts = [];

        this.insertFeature(feature);
      }
    }
  }
}