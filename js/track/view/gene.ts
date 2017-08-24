import Genoverse from './../../genoverse';
import TrackView from './../view';
import * as $ from 'jquery';

enum Bump {False, True, Label};

interface GeneViewProperties {
  margin: number,
  height: number,
  featureHeight: number,
  width: number,
  labels: boolean|string,
  repeatLabels: boolean,
  bump: Bump
}

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