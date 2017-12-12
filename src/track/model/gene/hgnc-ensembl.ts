import Genoverse from './../../../genoverse';
import GeneModel from './../gene';

export default class HgncEnsemblGeneModel extends GeneModel {
  
  constructor(genoverse: Genoverse){
    super(genoverse, {
      url: 'https://pace.genenames.org/cgi-bin/genoverse/ajax/genes-by-coord?chr=__CHR__&start=__START__&end=__END__&source=Ensembl',
      dataRequestLimit: 5000000 // As per e! REST API restrictions
    });
  }

  receiveData(data: any, chr: string, start: number, end: number){
    super.receiveData(data, chr, start, end);
    
  }

}