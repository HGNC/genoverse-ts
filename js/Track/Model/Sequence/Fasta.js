import SequenceModel from './../sequence';

export default class FastaSequenceModel extends SequenceModel {
  startByteRequest: JQuery.jqXHR<any>;
  url = 'http://genoverse.org/data/Homo_sapiens.GRCh37.72.dna.chromosome.1.fa';
  // Following settings could be left undefined and will be detected automatically via .getStartByte()
  startByte: number; // Byte in the file where the sequence actually starts
  lineLength: number; // Length of the sequence line in the file

  // TODO: Check if URL provided
  getData(chr: string, start: number, end: number): JQuery.Deferred<any, any, any>{
    const deferred = $.Deferred();

    $.when(this.getStartByte())
      .done(() => {
        start = start - start % this.chunkSize + 1;
        end   = end + this.chunkSize - end % this.chunkSize;
        const startByte = start - 1 + Math.floor((start - 1) / this.lineLength) + this.startByte;
        const endByte   = end   - 1 + Math.floor((end   - 1) / this.lineLength) + this.startByte;
        $.ajax({
          url       : this.parseURL(),
          dataType  : this.dataType,
          context   : this,
          headers   : { 'Range' : 'bytes=' + startByte + '-' + endByte },
          xhrFields : this.xhrFields,
          success   : function (data) { this.receiveData(data, chr, start, end); },
          error     : this.track.controller.showError
        })
          .done(() => {
            deferred.resolveWith(this);
          })
          .fail(() => { deferred.rejectWith(this); });
      })
      .fail(() => { deferred.rejectWith(this); });

    return deferred;
  }

  getStartByte(): JQuery.jqXHR<any> {
    if (this.startByteRequest) {
      return this.startByteRequest;
    }

    if (this.startByte === undefined || this.lineLength === undefined) {
      this.startByteRequest = $.ajax({
        url       : this.parseURL(),
        dataType  : 'text',
        context   : this,
        headers   : { 'Range': 'bytes=0-300' },
        xhrFields : this.xhrFields,
        success   : function (data) {
          if (data.indexOf('>') === 0) {
            this.startByte = data.indexOf('\n') + 1;
          } else {
            this.startByte = 0;
          }

          this.lineLength = data.indexOf('\n', this.startByte) - this.startByte;
        }
      });

      return this.startByteRequest;
    }
  }
}