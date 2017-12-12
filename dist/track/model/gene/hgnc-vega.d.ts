import Genoverse from './../../../genoverse';
import GeneModel from './../gene';
export default class HgncVegaGeneModel extends GeneModel {
    constructor(genoverse: Genoverse);
    receiveData(data: any, chr: string, start: number, end: number): void;
}
