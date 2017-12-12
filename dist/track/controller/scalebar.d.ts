/// <reference types="jquery" />
import Genoverse from './../../genoverse';
import TrackController from './../controller';
import ScalebarView from './../view/scalebar';
import ScalebarModel from './../model/scalebar';
export default class ScalebarTrack extends TrackController {
    forwardTrack: any;
    strand: number;
    lastLabel: any;
    seen: any;
    featuresById: any;
    featuresByChr: any;
    majorUnit: number;
    minorUnit: number;
    unsortable: boolean;
    order: number;
    orderReverse: number;
    featureStrand: number;
    controls: string;
    height: number;
    featureHeight: number;
    featureMargin: {
        [key: string]: number;
    };
    margin: number;
    minPixPerMajor: number;
    color: string;
    autoHeight: boolean;
    labels: boolean;
    bump: boolean;
    resizable: boolean;
    width: number;
    constructor(genoverse: Genoverse, properties?: any);
    init(): void;
    createView(): ScalebarView;
    createModel(): ScalebarModel;
    setEvents(): void;
    setScale(): void;
    setMajorMinorUnits(): void;
    setDefaults(): void;
    setFeatures(chr: string, start: number, end: number): void;
    makeFirstImage(moveTo?: any): JQuery.Deferred<any, any, any>;
    makeImage(params: any): any;
    makeReverseImage(params: any): void;
    renderBackground(f: any, bgImage: any, params: any): void;
}
