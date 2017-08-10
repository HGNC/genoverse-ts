import TrackModel from '../model';

interface FileReaderEventTarget extends EventTarget {
    result:string
}

interface FileReaderEvent extends Event {
    target: FileReaderEventTarget;
    getMessage():string;
}

export default abstract class FileModel extends TrackModel {
  dataFile: any;
  largeFile: any;
  isLocal: any;
  dataType = 'text';

  init() {
    if (this.isLocal) {
      this.url = false;
    }

    if (!this.largeFile) {
      this.allData = true;
    }

    super.init();
  }

  getData(...args: any[]) {
    const chr: string = args[0];
    const model = this;

    if (this.isLocal && this.dataFile) {
      var reader   = new FileReader();
      var deferred = $.Deferred();

      reader.onload = function (e: FileReaderEvent) {
        deferred.done(function () {
          this.receiveData(e.target.result, chr, 1, this.browser.getChromosomeSize(chr));
        }).resolveWith(model);
      };

      reader.readAsText(this.dataFile);

      return deferred;
    } else {
      return super.getData(chr);
    }
  }
}