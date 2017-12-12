import Genoverse from './../../../genoverse';
import GeneView from './../gene';



export default class HgncNcbiGeneView extends GeneView {
  
  setFeatureColor(feature: { color: string; legend: string; labelColor: string; logic_name: string; biotype: string; }): void {
    
    if(feature.biotype === 'protein-coding'){
      feature.color  = '#A00000';
      feature.legend = 'Protein coding';
    } else if(feature.biotype === 'pseudo'){
      feature.color  = '#666666';
      feature.legend = 'Pseudogene';
    } else if(feature.biotype === 'biological-region'){
      feature.color  = '#009933';
      feature.legend = 'Biological region';
    } else if(feature.biotype === 'other'){
      feature.color  = '#ff8000';
      feature.legend = 'Other';
    } else if (/rna/i.test(feature.biotype)) {
      feature.color  = '#8B668B';
      feature.legend = 'RNA gene';
    } else {
      feature.color  = '#FF0000';
      feature.legend = 'Unknown';
    }

    feature.labelColor = feature.color;
  }
}