import TrackView from './../view';
import Genoverse from './../../genoverse';

export default class ChromosomeView extends TrackView {
  
  drawnAcen: any;

  constructor(genoverse: Genoverse, properties?: any){
    super(genoverse, properties);
  }

  drawBackground(feature: any, canvasContext: CanvasRenderingContext2D, imgData: any): void {
    throw new Error("Method not implemented.");
  }

  drawFeature(feature: any, featureContext: any, labelContext: any, scale: any) {
    featureContext.fillStyle   = feature.color;
    featureContext.strokeStyle = '#000000';

    if (feature.type === 'acen') {
      featureContext.beginPath();
      if (this.drawnAcen) {
        featureContext.moveTo(feature.x + feature.width, 0.5);
        featureContext.lineTo(feature.x, (feature.height + 0.5) / 2);
        featureContext.lineTo(feature.x + feature.width, feature.height + 0.5);
      } else {
        featureContext.moveTo(feature.x, 0.5);
        featureContext.lineTo(feature.x + feature.width, (feature.height + 0.5) / 2);
        featureContext.lineTo(feature.x, feature.height + 0.5);
        this.drawnAcen = true;
      }

      featureContext.fill();
      featureContext.stroke();
    } else if (feature.type === 'stalk') {
      for (var i = 0; i < 2; i++) {
        featureContext.beginPath();

        featureContext.moveTo(feature.x, 0.5);
        featureContext.lineTo(feature.x + feature.width * 0.25, feature.height * 0.25 + 0.5);
        featureContext.lineTo(feature.x + feature.width * 0.75, feature.height * 0.25 + 0.5);
        featureContext.lineTo(feature.x + feature.width, 0.5);

        featureContext[i ? 'moveTo' : 'lineTo'](feature.x + feature.width, feature.height + 0.5);
        featureContext.lineTo(feature.x + feature.width * 0.75, feature.height * 0.75 - 0.5);
        featureContext.lineTo(feature.x + feature.width * 0.25, feature.height * 0.75 - 0.5);
        featureContext.lineTo(feature.x, feature.height + 0.5);

        featureContext[i ? 'stroke' : 'fill']();
      }
    } else {
      super.drawFeature(feature, featureContext, labelContext, scale);

      featureContext.beginPath();

      var chrSize = this.browser.getChromosomeSize(feature.chr);
      const width = this.browser.width;
      
      const propHeight = feature.height + 0.5;
      if (feature.start === 1 && feature.end === chrSize) {
        featureContext.clearRect(0, 0, 5, propHeight);
        featureContext.clearRect(feature.width - 5, 0, 10, propHeight);
        featureContext.fillStyle = feature.color;
        featureContext.moveTo(5, 0.5);
        featureContext.lineTo(feature.width - 5, 0.5);
        featureContext.bezierCurveTo(width + 1, 0.5, width + 1, feature.height + 0.5, feature.width - 5, feature.height + 0.5);
        featureContext.lineTo(5, feature.height + 0.5);
        featureContext.bezierCurveTo(-1, feature.height + 0.5, -1, 0.5, 5, 0.5);
        featureContext.fill();
      } else if (feature.start === 1) {
        featureContext.clearRect(0, 0, 5, propHeight);
        featureContext.fillStyle = feature.color;
        featureContext.moveTo(5, 0.5);
        featureContext.lineTo(feature.x + feature.width, 0.5);
        featureContext.moveTo(5, feature.height + 0.5);
        featureContext.lineTo(feature.x + feature.width, feature.height + 0.5);
        featureContext.moveTo(5, 0.5);
        featureContext.bezierCurveTo(-1, 0.5, -1, feature.height + 0.5, 5, feature.height + 0.5);
        featureContext.fill();
      } else if (feature.end === this.browser.chromosomeSize) {
        featureContext.clearRect(feature.x + feature.width - 5, 0, 10, propHeight);
        featureContext.fillStyle = feature.color;
        featureContext.moveTo(feature.x, 0.5);
        featureContext.lineTo(feature.x + feature.width - 5, 0.5);
        featureContext.moveTo(feature.x, feature.height + 0.5);
        featureContext.lineTo(feature.x + feature.width - 5, feature.height + 0.5);
        featureContext.moveTo(feature.x + feature.width - 5, 0.5);
        featureContext.bezierCurveTo(width + 1, 0.5, width + 1, feature.height + 0.5, feature.x + feature.width - 5, feature.height + 0.5);
        featureContext.fill();
      } else {
        featureContext.moveTo(feature.x, 0.5);
        featureContext.lineTo(feature.x + feature.width, 0.5);
        featureContext.moveTo(feature.x, feature.height + 0.5);
        featureContext.lineTo(feature.x + feature.width, feature.height + 0.5);
      }

      featureContext.stroke();
    }
  }

  drawLabel(feature: any) {
    if ((feature.start === 1 || feature.end === this.browser.getChromosomeSize(feature.chr)) && feature.labelWidth >= Math.floor(feature.width - 5)) {
      return;
    }

    super.drawLabel(arguments[0], arguments[1], arguments[2]);
  }

  decorateFeature(feature: any, featureContext: any, scale: any) {
    throw new Error("Method not implemented.");
  }
}