// Ensembl REST API Transcript model
import Genoverse from './../../../genoverse';
import TranscriptModel from './../transcript';

export default class EnsemblTranscriptModel extends TranscriptModel {
  
  constructor(genoverse: Genoverse){
    super(genoverse, {
      url: '//rest.ensembl.org/overlap/region/human/__CHR__:__START__-__END__?feature=transcript;feature=exon;feature=cds;content-type=application/json',
      dataRequestLimit: 5000000 // As per e! REST API restrictions
    });
  }

  // The url above responds in json format, data is an array
  // See rest.ensembl.org/documentation/info/feature_region for more details
  parseData(data: any[], chr: string) {
    for (let i = 0; i < data.length; i++) {
      const feature = data[i];

      if (feature.feature_type === 'transcript' && !this.featuresById[feature.id]) {
        this.geneIds[feature.Parent] = this.geneIds[feature.Parent] || ++this.seenGenes;

        feature.chr   = feature.chr || chr;
        feature.label = parseInt(feature.strand, 10) === 1 ? (feature.external_name || feature.id) + ' >' : '< ' + (feature.external_name || feature.id);
        feature.sort  = (this.geneIds[feature.Parent] * 1e10) + (feature.logic_name.indexOf('ensembl_havana') === 0 ? 0 : 2e9) + (feature.biotype === 'protein_coding' ? 0 : 1e9) + feature.start + i;
        feature.exons = {};
        feature.cds   = {};

        this.insertFeature(feature);
      } else if (feature.feature_type === 'exon' && this.featuresById[feature.Parent]) {
        if (!this.featuresById[feature.Parent].exons[feature.id]) {
          this.featuresById[feature.Parent].exons[feature.id] = feature;
        }
      } else if (feature.feature_type === 'cds' && this.featuresById[feature.Parent]) {
        feature.id = feature.chr + ':' + feature.start + '-' + feature.end;

        if (!this.featuresById[feature.Parent].cds[feature.id]) {
          this.featuresById[feature.Parent].cds[feature.id] = feature;
        }
      }
    }
  }

  receiveData(data: any, chr: string, start: number, end: number){
    super.receiveData(data, chr, start, end);
    
  }
}