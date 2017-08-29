import Genoverse from './../../../genoverse';
import GeneModel from './../gene';

export default class EnsemblGeneModel extends GeneModel {
  
  constructor(genoverse: Genoverse){
    super(genoverse, {
      url: '//rest.ensembl.org/overlap/region/human/__CHR__:__START__-__END__?feature=gene;content-type=application/json',
      dataRequestLimit: 5000000 // As per e! REST API restrictions
    });
  }

}