import TrackView from './../view';
import Genoverse from './../../genoverse';
export default class ChromosomeView extends TrackView {
    drawnAcen: any;
    constructor(genoverse: Genoverse, properties?: any);
    drawBackground(feature: any, canvasContext: CanvasRenderingContext2D, imgData: any): void;
    drawFeature(feature: any, featureContext: any, labelContext: any, scale: any): void;
    drawLabel(feature: any): void;
    decorateFeature(feature: any, featureContext: any, scale: any): void;
}
