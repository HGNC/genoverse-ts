import TrackModel from './../model';

export default abstract class SequenceModel extends TrackModel {
  chunksByChr: {[key: string]: any};
  threshold = 100000;
  chunkSize = 1000;
  buffer    = 0;
  dataType  = 'text';

  setChrProps(): void {
    const chr = this.browser.chr;
    super.setChrProps();
    this.chunksByChr      = this.chunksByChr || {};
    this.chunksByChr[chr] = this.chunksByChr[chr] || {};
  }

  getData(chr: string, start: number, end: number): JQuery.Deferred<any, any, any> {
    start = start - start % this.chunkSize + 1;
    end   = end + this.chunkSize - end % this.chunkSize;
    return super.getData(chr, start, end);
  }

  parseData(data: string, chr: string, start: number, end: number): void {
    data = data.replace(/\n/g, '');

    if (this.prop('lowerCase')) {
      data = data.toLowerCase();
    }

    for (let i = 0; i < data.length; i += this.chunkSize) {
      if (this.chunksByChr[chr][start + i]) {
        continue;
      }

      const feature = {
        id       : chr + ':' + start + i,
        chr      : chr,
        start    : start + i,
        end      : start + i + this.chunkSize,
        sequence : data.substr(i, this.chunkSize),
        sort     : start + i
      };

      this.chunksByChr[chr][feature.start] = feature;
      this.insertFeature(feature);
    }
  }
}