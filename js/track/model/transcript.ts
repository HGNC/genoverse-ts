import Genoverse from './../../genoverse';
import TrackModel from '../model';

interface TranscriptModelPropeties {
  url: string,
  dataRequestLimit: number
}

export default abstract class TranscriptModel extends TrackModel {
  seenGenes: number;
  geneIds: any;

  constructor(genoverse: Genoverse, properties: TranscriptModelPropeties){
    super(genoverse, properties);
  }

  setDefaults() {
    this.geneIds   = {};
    this.seenGenes = 0;
    super.setDefaults();
  }

  abstract parseData(data: any[], chr: string);
}