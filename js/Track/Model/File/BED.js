import FileModel from '../file';

export default class BEDModel extends FileModel {
  parseData(text: string, chr: string) {
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const fields = lines[i].split('\t');

      if (fields.length < 3) {
        continue;
      }

      if (fields[0] == chr || fields[0].toLowerCase() == 'chr' + chr || fields[0].match('[^1-9]' + chr + '$')) {
        
        const score = parseFloat(fields[4]);
        let color = '#000000';

        if (fields[8]) {
          color = 'rgb(' + fields[8] + ')';
        } else {
          color = this.scoreColor(isNaN(score) ? 1000 : score);
        }

        this.insertFeature({
          chr             : chr,
          start           : parseInt(fields[1], 10),
          end             : parseInt(fields[2], 10),
          id              : chr + ':' + fields[1] + '-' + fields[3],
          label           : fields[3],
          color           : color,
          originalFeature : fields
        });
      }
    }
  }

  scoreColor(score: number): string {
    if (score <= 166) { return 'rgb(219,219,219)'; }
    if (score <= 277) { return 'rgb(186,186,186)'; }
    if (score <= 388) { return 'rgb(154,154,154)'; }
    if (score <= 499) { return 'rgb(122,122,122)'; }
    if (score <= 611) { return 'rgb(94,94,94)';    }
    if (score <= 722) { return 'rgb(67,67,67)';    }
    if (score <= 833) { return 'rgb(42,42,42)';    }
    if (score <= 944) { return 'rgb(21,21,21)';    }
    return '#000000';
  }
}