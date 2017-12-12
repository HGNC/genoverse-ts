import Genoverse from './../../genoverse';
import TrackModel from './../model';

export default abstract class StaticModel extends TrackModel{
  constructor(genoverse: Genoverse){
    super(genoverse);
    this.url = false;
  }
  
  checkDataRange(){ return true; }
}