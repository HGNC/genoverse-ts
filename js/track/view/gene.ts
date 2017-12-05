import Genoverse from './../../genoverse';
import TrackView from './../view';
import {GeneViewProperties} from './../../interfaces/gene';
import * as $ from '../../../node_modules/jquery/dist/jquery.js';

export default abstract class GeneView extends TrackView {
  
  constructor(genoverse: Genoverse, properties: GeneViewProperties){
    super(genoverse, properties);
  }

  drawBackground(feature: any, canvasContext: CanvasRenderingContext2D, imgData: any): void {
    $.noop;
  }

  decorateFeature(feature: any, featureContext: any, scale: any): void {
    $.noop;
  }

  abstract setFeatureColor(feature: {
    color: string,
    legend: string,
    labelColor: string
  }): void;
}