import Genoverse from './../../genoverse';
import TrackModel from './../model';
import { GeneModelPropeties } from './../../interfaces/gene';
export default abstract class GeneModel extends TrackModel {
    constructor(genoverse: Genoverse, properties: GeneModelPropeties);
    parseData(data: any[], chr: string): void;
}
