import Genoverse from './../../../genoverse';
import FileTrack from './../file';
import BAMModel from './../../model/file/bam';
import SequenceView from './../../view/sequence';

export default class BAMTrack extends FileTrack {
  name      = 'BAM';
  indexExt  = '.bai';
  threshold = 100000;
  largeFile = true;
  model: BAMModel;
  view: SequenceView;

  constructor(genoverse: Genoverse, config?: any){
    super(genoverse, config);
    this.view = new SequenceView(genoverse, {
      bump       : true,
      autoHeight : true
    });
    this.model = new BAMModel(genoverse, );
  }
  
  click() {
    const menu = this.base.apply(this, arguments);
    
    if (menu) {
      menu.addClass('gv-wrap-values');
    }

    return menu;
  }

  populateMenu(feature: any) {
    const f = $.extend({ title: feature.readName }, feature);
    delete f.sequence;
    delete f.id;
    return super.populateMenu(f);
  }
}