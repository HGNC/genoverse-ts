import Genoverse from './../../genoverse';
import TrackView from '../view';
import { GeneViewProperties } from './../../interfaces/gene';
export default abstract class TranscriptView extends TrackView {
    utrHeight: number;
    intronLineWidth: number;
    intronStyle: string;
    constructor(genoverse: Genoverse, properties?: GeneViewProperties);
    drawBackground(feature: any, canvasContext: CanvasRenderingContext2D, imgData: any): void;
    decorateFeature(feature: any, featureContext: any, scale: any): void;
    drawFeature(transcript: any, featureContext: any, labelContext: any, scale: number): void;
    drawIntron(intron: any, context: any): void;
    getTruncatedIntronCoords(intron: any): false | {
        x1: any;
        y1: any;
        x2: any;
        y2: any;
        x3: any;
        y3: any;
    };
}
