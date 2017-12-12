import Genoverse from './../../../genoverse';
import StaticModel from '../static';
export default class LegendModel extends StaticModel {
    type: any;
    width: number;
    constructor(genoverse: Genoverse, properties: any);
    findFeatures(): any;
    sortFeatures(features: any): any;
}
