import Genoverse from './../../genoverse';
import TrackModel from './../model';
export default abstract class StaticModel extends TrackModel {
    constructor(genoverse: Genoverse);
    checkDataRange(): boolean;
}
