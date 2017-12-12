import Genoverse from './../../genoverse';
import TrackView from './../view';
import { GeneViewProperties } from './../../interfaces/gene';
export default abstract class GeneView extends TrackView {
    constructor(genoverse: Genoverse, properties: GeneViewProperties);
    drawBackground(feature: any, canvasContext: CanvasRenderingContext2D, imgData: any): void;
    decorateFeature(feature: any, featureContext: any, scale: any): void;
    abstract setFeatureColor(feature: {
        color: string;
        legend: string;
        labelColor: string;
    }): void;
}
