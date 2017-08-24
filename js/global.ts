import Genoverse from './genoverse';
import ScalebarTrack from './track/library/scalebar';
import EnsemblGeneTrack from './track/library/gene/ensembl';

(<any>window).Genoverse = Genoverse;

document.addEventListener('DOMContentLoaded', function() {
  var genoverseConfig = {
    container : '#genoverse',
    width     : 800,
    genome    : 'grch38',
    chr       : 13,
    start     : 32296945,
    end       : 32370557,
    useHash: false,
    urlParamTemplate: false,
    trackAutoHeight: true,  
    plugins: ['controlPanel', 'karyotype'],
    tracks: [
      ScalebarTrack,
      EnsemblGeneTrack
    ]
  };
  new Genoverse(genoverseConfig, 'main');
}, false);