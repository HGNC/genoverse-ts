import Genoverse from './../../genoverse';
import TrackView from '../view';
export default abstract class StaticView extends TrackView {
    constructor(genoverse: Genoverse, properties?: any);
    positionFeature(): void;
    scaleFeatures(features: any): any;
    draw(features: any, featureContext: any, labelContext: any, scale: any): void;
}
