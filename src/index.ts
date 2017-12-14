import Genoverse from './genoverse';
import ScalebarTrack from './track/controller/scalebar';
import EnsemblGeneTrack from './track/controller/gene/ensembl';
import HgncEnsemblTrack from './track/controller/gene/hgnc-ensembl';
import HgncNcbiGeneTrack from './track/controller/gene/hgnc-ncbi';
import HgncVegaGeneTrack from './track/controller/gene/hgnc-vega';



document.addEventListener('DOMContentLoaded', function() {
  var genoverseConfig = {
    container : '#genoverse',
    width     : 800,
    genome    : 'grch38',
    chr       : 13,
    start     : 32296945,
    end       : 32420516,
    useHash: false,
    urlParamTemplate: false,
    trackAutoHeight: true,  
    plugins: ['controlPanel', 'karyotype'],
    tracks: [
      ScalebarTrack,
      //EnsemblGeneTrack,
      HgncEnsemblTrack,
      HgncNcbiGeneTrack,
      HgncVegaGeneTrack
    ],
    libraryTracks: [
      EnsemblGeneTrack
    ]
  };
  new Genoverse(genoverseConfig, 'main');
}, false);