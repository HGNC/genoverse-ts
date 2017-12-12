import Genoverse from './../../../genoverse';
import TranscriptModel from './../transcript';
export default class EnsemblTranscriptModel extends TranscriptModel {
    constructor(genoverse: Genoverse);
    parseData(data: any[], chr: string): void;
    receiveData(data: any, chr: string, start: number, end: number): void;
}
