import GeneModel from './../gene';

export default class EnsemblModel extends GeneModel {
  url              = '//rest.ensembl.org/overlap/region/human/__CHR__:__START__-__END__?feature=gene;content-type=application/json';
  dataRequestLimit = 5000000; // As per e! REST API restrictions

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