/// <reference types="jquery" />
import TrackModel from './../model';
export default class ChromosomeModel extends TrackModel {
    colors: {
        [key: string]: string;
    };
    labelColors: {
        [key: string]: string;
    };
    insertFeature(feature: any): void;
    getData(chr: string, start: number, end: number): JQuery.Deferred<any, any, any>;
}
