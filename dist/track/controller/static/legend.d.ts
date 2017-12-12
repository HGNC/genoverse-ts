import Genoverse from './../../../genoverse';
import StaticTrack from "./../static";
import LegendModel from "./../../model/static/legend";
import LegendView from "./../../view/static/legend";
export default class LegendTrack extends StaticTrack {
    tracks: any[];
    type: any;
    order: any;
    removable: boolean;
    lockToTrack: boolean;
    constructor(genoverse: Genoverse, properties: any);
    init(): void;
    setEvents(): void;
    setTracks(): void;
    updateOrder(): void;
    enable(): void;
    disable(): void;
    createModel(): LegendModel;
    createView(properties?: Object): LegendView;
    destroy(): void;
    setDefaults(): void;
}
