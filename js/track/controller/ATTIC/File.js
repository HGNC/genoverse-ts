import Track from './../../track';

export default class FileTrack extends Track {
  setInterface() {
    super.setInterface();
    this._interface.isLocal   = 'model';
    this._interface.dataFile  = 'model';
    this._interface.indexFile = 'model';
    this._interface.largeFile = 'model';
  }
}