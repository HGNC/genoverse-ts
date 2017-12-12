import Genoverse from './../../../genoverse';
import StaticView from '../static';
export default class LegendView extends StaticView {
    decorateFeature(feature: any, featureContext: any, scale: any): void;
    drawBackground(feature: any, canvasContext: CanvasRenderingContext2D, imgData: any): void;
    textColor: string;
    constructor(genoverse: Genoverse, properties?: any);
    positionFeatures(f: any, params: any): any;
}
