import * as $ from 'jquery';
import Genoverse from '../genoverse';
import RTree from 'rtree';

enum Bump {False, True, Label}

export default abstract class TrackView {
  width: number;
  browser: Genoverse;
  labelUnits: string[];
  font: string;
  context: CanvasRenderingContext2D;
  scaleSettings: any;
  fontHeight = 10;
  fontFamily       = 'sans-serif';
  fontWeight       = 'normal';
  fontColor: string; // label color defaults to this, or feature color, or track.color (below), in that order of precedence
  color            = '#000000';
  minScaledWidth   = 0.5;
  widthCorrection  = 1; // Pixels to add to the end of a feature when scale > 1 - ensures that 1bp features are always at least 1px wide
  labels: string|boolean = 'default';
  repeatLabels     = false;
  bump: Bump       = Bump.False;
  alwaysReposition = false;
  depth: number;
  featureHeight: number; // defaults to track height
  featureMargin: any;
  defaultHeight: number;
  margin: any;
  resizable: string|boolean;
  height: number;
  minLabelHeight: number;
  
  constructor(genoverse: Genoverse, properties?: any) {
    this.browser = genoverse;
    if(properties){
      $.extend(this, properties);
    }
    this.init();
  }

  init() {
    this.setDefaults();
    this.scaleSettings = {};
  }

  abstract decorateFeature(feature: any, featureContext: any, scale: any): any;

  setDefaults(...args: any[]) {
    this.featureMargin = this.featureMargin || { top: 3, right: 1, bottom: 1, left: 0 };

    const margin = [ 'top', 'right', 'bottom', 'left' ];

    for (let i = 0; i < margin.length; i++) {
      if (typeof this.featureMargin[margin[i]] !== 'number') {
        this.featureMargin[margin[i]] = 0;
      }
    }

    this.context       = (<HTMLCanvasElement>$('<canvas>')[0]).getContext('2d');
    this.featureHeight = typeof this.featureHeight !== 'undefined' ? this.featureHeight : undefined;
    if(! this.featureHeight) throw new Error("No height set");
    this.font          = this.fontWeight + ' ' + this.fontHeight + 'px ' + this.fontFamily;
    this.labelUnits    = [ 'bp', 'kb', 'Mb', 'Gb', 'Tb' ];

    this.context.font = this.font;

    if (this.labels && this.labels !== 'overlay' && (this.depth || this.bump === Bump.Label)) {
      this.labels = 'separate';
    }
  }

  setScaleSettings(scale: any) {
    var chr = this.browser.chr;
    if (!this.scaleSettings[chr]) {
      this.scaleSettings[chr] = {};
    }
    
    if (!this.scaleSettings[chr][scale]) {
      var featurePositions = new RTree();

      this.scaleSettings[chr][scale] = {
        imgContainers    : $(),
        featurePositions : featurePositions,
        labelPositions   : this.labels === 'separate' ? new RTree() : featurePositions
      };
    }
    return this.scaleSettings[chr][scale];
  }

  scaleFeatures(features: any, scale: number) {
    const add = Math.max(scale, this.widthCorrection);
    let feature;

    for (let i = 0; i < features.length; i++) {
      feature = features[i];

      if (!feature.position) {
        feature.position = {};
      }

      if (!feature.position[scale]) {
        feature.position[scale] = {
          start  : feature.start * scale,
          width  : Math.max((feature.end - feature.start) * scale + add, this.minScaledWidth),
          height : feature.height || this.featureHeight
        };
      }
    }

    return features;
  }

  positionFeatures(features: any, params: any) {
    params.margin = this.margin;
    
    for (let i = 0; i < features.length; i++) {
      this.positionFeature(features[i], params);
    }
    params.width         = Math.ceil(params.width);
    params.height        = Math.ceil(params.height);
    params.featureHeight = Math.max(Math.ceil(params.featureHeight), this.resizable ? Math.max(this.height, this.minLabelHeight) : 0);
    params.labelHeight   = Math.ceil(params.labelHeight);
    
    return features;
  }

  positionFeature(feature: any, params: any) {
    const scale         = params.scale;
    const scaleSettings = this.scaleSettings[feature.chr][scale];

    if (!scaleSettings) {
      return;
    }
    
    feature.position[scale].X = feature.position[scale].start - params.scaledStart; // FIXME: always have to reposition for X, in case a feature appears in 2 images. Pass scaledStart around instead?
    if (this.alwaysReposition || !feature.position[scale].positioned) {
      
      feature.position[scale].H = feature.position[scale].height + this.featureMargin.bottom;
      feature.position[scale].W = feature.position[scale].width  + (feature.marginRight || this.featureMargin.right);
      feature.position[scale].Y = (
        typeof feature.position[scale].y === 'number' ? feature.position[scale].y :
        typeof feature.y                 === 'number' ? feature.y * feature.position[scale].H : 0
      ) + (feature.marginTop || this.featureMargin.top);
      if (feature.label) {
        if (typeof feature.label === 'string') {
          feature.label = feature.label.split('\n');
        }

        var context = this.context;

        feature.labelHeight = feature.labelHeight || (this.fontHeight + 2) * feature.label.length;
        feature.labelWidth  = feature.labelWidth  || Math.max.apply(Math, $.map(feature.label, function (l) { return Math.ceil(context.measureText(l).width); })) + 1;

        if (this.labels === true || this.labels === 'default') {
          feature.position[scale].H += feature.labelHeight;
          feature.position[scale].W  = Math.max(feature.labelWidth, feature.position[scale].W);
        } else if (this.labels === 'separate' && !feature.position[scale].label) {
          feature.position[scale].label = {
            x: feature.position[scale].start,
            y: feature.position[scale].Y,
            w: feature.labelWidth,
            h: feature.labelHeight
          };
        }
      }

      const bounds = {
        x: feature.position[scale].start,
        y: feature.position[scale].Y,
        w: feature.position[scale].W,
        h: feature.position[scale].H + (feature.marginTop || this.featureMargin.top)
      };
      feature.position[scale].bounds = bounds;

      if (this.bump === Bump.True) {
        this.bumpFeature(bounds, feature, scale, scaleSettings.featurePositions);
      }
      
      scaleSettings.featurePositions.insert(bounds, feature);
      feature.position[scale].bottom     = feature.position[scale].Y + bounds.h + params.margin;    
      feature.position[scale].positioned = true;
    }

    if (this.labels === 'separate' && feature.position[scale].label) {
      
      if (this.alwaysReposition || !feature.position[scale].label.positioned) {
        this.bumpFeature(feature.position[scale].label, feature, scale, scaleSettings.labelPositions);

        feature.position[scale].label.bottom     = feature.position[scale].label.y + feature.position[scale].label.h + params.margin;
        feature.position[scale].label.positioned = true;

        scaleSettings.labelPositions.insert(feature.position[scale].label, feature);
      }

      params.labelHeight = Math.max(params.labelHeight, feature.position[scale].label.bottom);
    }
    params.featureHeight = Math.max(params.featureHeight, feature.position[scale].bottom);
    params.height        = Math.max(params.height, params.featureHeight + params.labelHeight);
  }





  // FIXME: should label bumping bounds be distinct from feature bumping bounds when label is smaller than feature?
  bumpFeature(bounds: any, feature: any, scale?: any, tree?: any) {
    let depth         = 0;
    const scaleSettings = this.scaleSettings[feature.chr][scale];
    const labels        = tree === scaleSettings.labelPositions && tree !== scaleSettings.featurePositions;
    let bump, clash;

    do {
      if (this.depth && ++depth >= this.depth) {
        if (!labels && $.grep(scaleSettings.featurePositions.search(bounds), function (f: any) { return f.position[scale].visible !== false; }).length) {
          feature.position[scale].visible = false;
        }

        break;
      }

      bump  = Bump.False;
      clash = tree.search(bounds)[0];

      if (clash && clash.id !== feature.id) {
        bounds.y = clash.position[scale][labels ? 'label' : 'bounds'].y + clash.position[scale][labels ? 'label' : 'bounds'].h;
        bump     = Bump.True;
      }
    } while (bump !== Bump.False);

    if (!labels) {
      feature.position[scale].Y = bounds.y;
    }
  }






  draw(features: any, featureContext: any, labelContext: any, scale: any) {
    let feature, f;
    for (let i = 0; i < features.length; i++) {
      feature = features[i];
      if (feature.position[scale].visible !== false) {
        // TODO: extend with feature.position[scale], rationalize keys
        f = $.extend({}, feature, {
          x             : feature.position[scale].X,
          y             : feature.position[scale].Y,
          width         : feature.position[scale].width,
          height        : feature.position[scale].height,
          labelPosition : feature.position[scale].label
        });
        
        this.drawFeature(f, featureContext, labelContext, scale);

        if (f.legend !== feature.legend) {
          feature.legend      = f.legend;
          feature.legendColor = f.color;
        }
      }
    }
  }

  drawFeature(feature: any, featureContext: any, labelContext: any, scale: any) {
    if (feature.x < 0 || feature.x + feature.width > this.width) {
      this.truncateForDrawing(feature);
    }

    if (feature.color !== false) {
      
      if (!feature.color) {
        this.setFeatureColor(feature);
      }
      featureContext.fillStyle = feature.color;
      featureContext.fillRect(feature.x, feature.y, feature.width, feature.height);
    }

    if (feature.clear === true) {
      featureContext.clearRect(feature.x, feature.y, feature.width, feature.height);
    }

    if (this.labels && feature.label) { 
      this.drawLabel(feature, labelContext, scale);
    }

    if (feature.borderColor) {
      featureContext.strokeStyle = feature.borderColor;
      featureContext.strokeRect(feature.x, feature.y + 0.5, feature.width, feature.height);
    }

    if (feature.decorations) {
      this.decorateFeature(feature, featureContext, scale);
    }
  }

  drawLabel(feature: any, context: any, scale?: any) {
    const original = feature.untruncated;
    const width    = (original || feature).width;
    if (this.labels === 'overlay' && feature.labelWidth >= Math.floor(width)) {
      return;
    }

    if (feature.labelPosition) {
      context.labelPositions = context.labelPositions || new RTree();
    }

    if (typeof feature.label === 'string') {
      feature.label = [ feature.label ];
    }

    const x       = (original || feature).x;
    let n       = this.repeatLabels ? Math.ceil((width - Math.max(scale, 1) - (this.labels === 'overlay' ? feature.labelWidth : 0)) / this.width) || 1 : 1;
    let spacing = width / n;
    let label, start, j, y, currentY, h;

    if (this.repeatLabels && (scale > 1 || this.labels !== 'overlay')) { // Ensure there's always a label in each image
      spacing = this.browser.length * scale;
      n = Math.ceil(width / spacing);
    }

    if (!feature.labelColor) {
      this.setLabelColor(feature);
    }

    context.fillStyle = feature.labelColor;

    if (this.labels === 'overlay') {
      label = [ feature.label.join(' ') ];
      y     = feature.y + (feature.height + 1) / 2;
      h     = 0;
    } else {
      label = feature.label;
      y     = feature.labelPosition ? feature.labelPosition.y : feature.y + feature.height + this.featureMargin.bottom;
      h     = this.fontHeight + 2;
    }

    let i      = context.textAlign === 'center' ? 0.5 : 0;
    let offset = feature.labelWidth * i;

    if (n > 1) {
      i += Math.max(Math.floor(-(feature.labelWidth + x) / spacing), 0);
    }

    for (; i < n; i++) {
      start = x + (i * spacing);

      if (start + feature.labelWidth >= 0) {
        if ((start - offset > this.width) || (i >= 1 && start + feature.labelWidth > feature.position[scale].X + feature.position[scale].width)) {
          break;
        }

        for (j = 0; j < label.length; j++) {
          currentY = y + (j * h);

          if (context.labelPositions && context.labelPositions.search({ x: start, y: currentY, w: feature.labelWidth, h: h }).length) {
            feature.position[scale].label.visible = false;
            continue;
          }

          context.fillText(label[j], start, currentY);

          if (context.labelPositions) {
            context.labelPositions.insert({ x: start, y: currentY, w: feature.labelWidth, h: h }, label[j]);
          }
        }
      }
    }
  }

  setFeatureColor(feature: any) {
    feature.color = this.color;
  }

  setLabelColor(feature: any) {
    feature.labelColor = this.fontColor || feature.color || this.color;
  }

  // Method to lighten a color by an amount, adapted from http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
  shadeColor(color: any, percent: any) {
    let f = parseInt(color.slice(1), 16);
    let R = f >> 16;
    let G = f >> 8 & 0x00FF;
    let B = f & 0x0000FF;

    return '#' + (
      0x1000000 +
      (Math.round((255 - R) * percent) + R) * 0x10000 +
      (Math.round((255 - G) * percent) + G) * 0x100 +
      (Math.round((255 - B) * percent) + B)
    ).toString(16).slice(1);
  }

  // truncate features - make the features start at 1px outside the canvas to ensure no lines are drawn at the borders incorrectly
  truncateForDrawing(feature: any) {
    const start = Math.min(Math.max(feature.x, -1), this.width + 1);
    let width = feature.x - start + feature.width;

    if (width + start > this.width) {
      width = this.width - start + 1;
    }

    feature.untruncated = { x: feature.x, width: feature.width };
    feature.x           = start;
    feature.width       = Math.max(width, 0);
  }

  formatLabel (label: any): string {
    const power = Math.floor((label.toString().length - 1) / 3);
    const unit  = this.labelUnits[power];

    label /= Math.pow(10, power * 3);

    return Math.floor(label) + (unit === 'bp' ? '' : '.' + (label.toString().split('.')[1] || '').concat('00').substring(0, 2)) + ' ' + unit;
  }

  abstract drawBackground(feature: any, canvasContext: CanvasRenderingContext2D, imgData: any): void;

}