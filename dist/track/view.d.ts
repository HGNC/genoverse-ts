import Genoverse from '../genoverse';
export declare enum Bump {
    False = 0,
    True = 1,
    Label = 2,
}
export default abstract class TrackView {
    width: number;
    browser: Genoverse;
    labelUnits: string[];
    font: string;
    context: CanvasRenderingContext2D;
    scaleSettings: any;
    fontHeight: number;
    fontFamily: string;
    fontWeight: string;
    fontColor: string;
    color: string;
    minScaledWidth: number;
    widthCorrection: number;
    labels: string | boolean;
    repeatLabels: boolean;
    bump: Bump;
    alwaysReposition: boolean;
    depth: number;
    featureHeight: number;
    featureMargin: any;
    defaultHeight: number;
    margin: any;
    resizable: string | boolean;
    height: number;
    minLabelHeight: number;
    constructor(genoverse: Genoverse, properties?: any);
    init(): void;
    abstract decorateFeature(feature: any, featureContext: any, scale: any): any;
    setDefaults(...args: any[]): void;
    setScaleSettings(scale: any): any;
    scaleFeatures(features: any, scale: number): any;
    positionFeatures(features: any, params: any): any;
    positionFeature(feature: any, params: any): void;
    bumpFeature(bounds: any, feature: any, scale?: any, tree?: any): void;
    draw(features: any, featureContext: any, labelContext: any, scale: any): void;
    drawFeature(feature: any, featureContext: any, labelContext: any, scale: any): void;
    drawLabel(feature: any, context: any, scale?: any): void;
    setFeatureColor(feature: any): void;
    setLabelColor(feature: any): void;
    shadeColor(color: any, percent: any): string;
    truncateForDrawing(feature: any): void;
    formatLabel(label: any): string;
    abstract drawBackground(feature: any, canvasContext: CanvasRenderingContext2D, imgData: any): void;
}
