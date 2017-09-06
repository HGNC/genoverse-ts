import Genoverse from './../../../genoverse';
import StaticView from '../static';
import * as $ from 'jquery';

export default class LegendView extends StaticView {
  decorateFeature(feature: any, featureContext: any, scale: any) {
    throw new Error("Method not implemented.");
  }
  
  drawBackground(feature: any, canvasContext: CanvasRenderingContext2D, imgData: any): void {
    throw new Error("Method not implemented.");
  }

  textColor: string;

  constructor(genoverse: Genoverse, properties?: any) {
    super(genoverse, properties);
    this.textColor     = '#000000';
    this.labels        = 'overlay';
    this.featureHeight = 12;
  }
  
  positionFeatures(f, params) {
    if (params.positioned) {
      return f;
    }

    const cols     = 2;
    const pad      = 5;
    const w        = 20;
    let x        = 0;
    let y        = 0;
    const xScale   = this.width / cols;
    const yScale   = this.fontHeight + pad;
    const features = [];
    let xPos, yPos, labelWidth;

    for (let i = 0; i < f.length; i++) {
      xPos       = (x * xScale) + pad;
      yPos       = (y * yScale) + pad;
      labelWidth = this.context.measureText(f[i][0]).width;
      features.push(
        { x: xPos,           y: yPos, width: w,              height: this.featureHeight, color: f[i][1] },
        { x: xPos + pad + w, y: yPos, width: labelWidth + 1, height: 0,                  color: false, labelColor: this.textColor, labelWidth: labelWidth, label: f[i][0] }
      );

      if (++x === cols) {
        x = 0;
        y++;
      }
    }

    this.height =  f.length ? ((y + (x ? 1 : 0)) * yScale) + pad : 0;
    params.height     = this.height;
    params.width      = this.width;
    params.positioned = true;
    return super.positionFeatures(features, params);
  }
}