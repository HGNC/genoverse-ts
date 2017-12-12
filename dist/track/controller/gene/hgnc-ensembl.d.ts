/// <reference types="jquery" />
import Genoverse from './../../../genoverse';
import LegendTrack from './../static/legend';
import GeneTrack from './../gene';
import TrackView from './../../view';
import TrackModel from './../../model';
export default class HgncEnsemblGeneTrack extends GeneTrack {
    legendTrack: LegendTrack;
    legendType: string;
    modelStore: {
        [name: string]: TrackModel;
    };
    viewStore: {
        [name: string]: TrackView;
    };
    static Name: string;
    constructor(genoverse: Genoverse);
    init(): void;
    makeFirstImage(moveTo?: any): JQuery.Deferred<any, any, any>;
    addLegend(): void;
    createView(): TrackView;
    populateMenu(feature: any): {
        [key: string]: any;
    };
}
