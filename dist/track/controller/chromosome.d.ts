import Genoverse from './../../genoverse';
import TrackController from './../controller';
import ChromosomeModel from './../model/chromosome';
import ChromosomeView from './../view/chromosome';
import './../../lib/jquery-tipsy';
export default class ChromosomeTrack extends TrackController {
    hoverFeature: any;
    id: string;
    margin: number;
    featureMargin: {
        [key: string]: number;
    };
    labels: string;
    url: boolean;
    allData: boolean;
    height: number;
    featureHeight: number;
    border: boolean;
    legend: boolean;
    unsortable: boolean;
    name: string;
    width: number;
    constructor(genoverse: Genoverse, properties?: any);
    init(): void;
    trackFactory(genoverse: Genoverse, properties: any): ChromosomeTrack;
    setEvents(): void;
    createModel(): ChromosomeModel;
    createView(): ChromosomeView;
    click(e: MouseEvent): void;
    addUserEventHandlers(): void;
    afterSetName(): void;
    populateMenu(feature: any): {
        title: any;
        Position: string;
    };
}
