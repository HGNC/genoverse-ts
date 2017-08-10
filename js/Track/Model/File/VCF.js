import FileModel from '../file';

export default class VCFModel extends FileModel {
  parseData(text: string, chr: string) {
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].length || lines[i].indexOf('#') === 0) {
        continue;
      }

      const fields = lines[i].split('\t');

      if (fields.length < 5) {
        continue;
      }

      if (fields[0] == chr || fields[0] == 'chr' + chr) {
        const id      = fields.slice(0, 3).join('|');
        const start   = parseInt(fields[1], 10);
        const alleles = fields[4].split(',');

        alleles.unshift(fields[3]);

        for (let j = 0; j < alleles.length; j++) {
          const end = start + alleles[j].length - 1;

          this.insertFeature({
            id              : id + '|' + alleles[j],
            sort            : j,
            chr             : chr,
            start           : start,
            end             : end,
            width           : end - start,
            allele          : j === 0 ? 'REF' : 'ALT',
            sequence        : alleles[j],
            label           : alleles[j],
            labelColor      : '#FFFFFF',
            originalFeature : fields
          });
        }
      }
    }
  }
}
