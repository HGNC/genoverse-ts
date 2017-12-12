import TrackView from './../view';
import Genoverse from './../../genoverse';
export default class ScalebarView extends TrackView {
    colors: {
        majorGuideLine: string;
        minorGuideLine: string;
    };
    minorUnit: number;
    guideLines: any;
    constructor(genoverse: Genoverse, properties?: any);
    draw(features: any, featureContext: any, labelContext: any, scale: any): void;
    drawBackground(f: any, context: CanvasRenderingContext2D, params: any): void;
    decorateFeature(feature: any, featureContext: any, scale: any): void;
    formatLabel(label: any): any;
}
