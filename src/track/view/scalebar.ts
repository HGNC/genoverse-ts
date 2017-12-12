import TrackView from './../view';
import Genoverse from './../../genoverse';

export default class ScalebarView extends TrackView {
  colors = {
    majorGuideLine : '#CCCCCC',
    minorGuideLine : '#E5E5E5'
  };
  minorUnit: number;
  guideLines: any;
  
  constructor(genoverse: Genoverse, properties?: any){
    super(genoverse, properties);
    
  }

  draw(features, featureContext, labelContext, scale) {
    let i         = features.length;
    const minorUnit = this.minorUnit;
    const width     = Math.ceil(minorUnit * scale);
    let feature, start, end;

    featureContext.textBaseline = 'top';
    featureContext.fillStyle    = this.color;

    this.guideLines = { major: {} }; // FIXME: pass params to draw, rather than scale. set guideLines on params
    
    while (i--) {
      feature = features[i];
      start   = Math.round(feature.position[scale].X);
      end     = start + width - 1;

      this.drawFeature($.extend({}, feature, {
        x      : start,
        y      : 0,
        width  : Math.ceil(feature.position[scale].width),
        height : this.featureHeight
      }), featureContext, labelContext, scale);
      
      if (feature.label) {
        if (start > -1) {
          featureContext.fillRect(start, this.featureHeight, 1, this.featureHeight);
        }
        this.guideLines.major[feature.start] = true;
      }

      // Fiddle the location so that these [additional major] lines overlap with normal lines
      if (feature.end < feature.start) {
        start--;
        end++;
      }
      this.guideLines[feature.start]             = start;
      this.guideLines[feature.start + minorUnit] = end;
      
    }
    //top line
    featureContext.fillRect(0, 0, featureContext.canvas.width, 1);
    //bottom line
    featureContext.fillRect(0, this.featureHeight, featureContext.canvas.width, 1);
  }

  drawBackground(f: any, context: CanvasRenderingContext2D, params: any) {
    for (const i in this.guideLines) {
      if (this.guideLines[i] >= 0 && this.guideLines[i] <= this.width) {
        context.fillStyle = this.colors[this.guideLines.major[i] ? 'majorGuideLine' : 'minorGuideLine' ];
        context.fillRect(this.guideLines[i], 0, 1, context.canvas.height);
      }
    }
  }

  decorateFeature(feature: any, featureContext: any, scale: any) {
    throw new Error("Method not implemented.");
  }

  formatLabel(label) {
    return this.minorUnit < 1000 ? label.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') : super.formatLabel(label);
  }
}