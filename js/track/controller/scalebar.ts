import Genoverse from './../../genoverse';
import TrackController from './../controller';
import ScalebarView from './../view/scalebar';
import ScalebarModel from './../model/scalebar';
import RTree from 'rtree';
import * as $ from 'jquery';

export default class ScalebarTrack extends TrackController {
  forwardTrack: any;
  strand: number;
  lastLabel: any;
  seen: any;
  featuresById: any;
  featuresByChr: any;
  majorUnit: number;
  minorUnit: number;
  unsortable: boolean;
  order: number;
  orderReverse: number;
  featureStrand: number;
  controls: string;
  height: number;
  featureHeight: number;
  featureMargin: {[key: string]: number};
  margin: number;
  minPixPerMajor: number; // Least number of pixels per written number
  color: string;
  autoHeight: boolean;
  labels: boolean;
  bump: boolean;
  resizable: boolean;
  width: number;
  
  
  constructor(genoverse: Genoverse, properties?: any) {
    super(genoverse, properties);
    this.height         = 20;
    this.featureHeight  = 3;
    this.margin         = 0;
    this.unsortable = true;
    this.order          = 0;
    this.orderReverse   = 1e5;
    this.featureStrand  = 1;
    this.controls       = 'off';
    this.featureMargin  = { top: 0, right: 0, bottom: 2, left: 0 };
    this.minPixPerMajor = 100; // Least number of pixels per written number
    this.color          = '#000000';
    this.autoHeight     = false;
    this.labels         = true;
    this.bump           = false;
    this.resizable      = false;
    this.click = $.noop;
    this.init();
  }

  init() {
    this.model = this.createModel();
    this.setEvents();
    this.setDefaults();
    this.addDomElements();
    this.addUserEventHandlers();
    this.deferreds = []; // tracks deferreds so they can be stopped if the track is destroyed
    this.view = this.createView();
  }

  createView() {
    const prop = {
      minorUnit: this.minorUnit,
      margin: this.margin,
      height: this.height,
      featureHeight: this.featureHeight,
      width: this.width
    };
    return new ScalebarView(this.browser, prop);
  }

  createModel() {
    return new ScalebarModel(this.browser);
  }

  setEvents(): void {
    const browser = this.browser;

    function resize() {
      $('.gv-bg.gv-full-height', <JQuery<Element>>browser.container).height(function () {
        return browser.wrapper.outerHeight(true) - $(this).parents('.gv-track-container').position().top;
      });
    }

    browser.on('afterAddTracks', resize);
    browser.on('afterResize', this, resize);
  }

  setScale(): void {
    const features  = {};
    this.setMajorMinorUnits();
    features[this.browser.chr] = new RTree();
    this.featuresByChr = features;
    this.featuresById = {};
    this.seen = {};
    super.setScale();
  }

  setMajorMinorUnits(): void {
    const max       = this.browser.width / this.minPixPerMajor;
    let divisor   = 5;
    let majorUnit = -1;
    const fromDigit = ('' + this.browser.start).split(''); // Split into array of digits
    const toDigit   = ('' + this.browser.end).split('');
    let divisions, i;
    for (i = 0; i < fromDigit.length; i++) {
      divisions = parseInt(toDigit.slice(0, fromDigit.length - i).join(''), 10) - parseInt(fromDigit.slice(0, fromDigit.length - i).join(''), 10);

      if (divisions && divisions <= max) {
        majorUnit = parseInt('1' + $.map(new Array(i), function () { return '0'; }).join(''), 10);
        break;
      }
    }
    if (majorUnit === -1) {
      majorUnit = this.browser.length === 1 ? 1 : parseInt('1' + $.map(new Array(fromDigit.length), function () { return '0'; }).join(''), 10);
      divisor   = 1;
    } else {
      // Improve things by trying simple multiples of 1<n zeroes>.
      // (eg if 100 will fit will 200, 400, 500).
      if (divisions * 5 <= max) {
        majorUnit /= 5;
        divisor    = 2;
      } else if (divisions * 4 <= max) {
        majorUnit /= 4;
        divisor    = 1;
      } else if (divisions * 2 <= max) {
        majorUnit /= 2;
      }
    }
    majorUnit = Math.max(majorUnit, 1);
    this.majorUnit = majorUnit;
    this.minorUnit = Math.max(majorUnit / divisor, 1);
  }

  setDefaults(): void {
    super.setDefaults();
    this.width = this.browser.width;
    this.setMajorMinorUnits();
  }

  setFeatures(chr: string, start: number, end: number): void {
    const minorUnit = this.minorUnit;
    const majorUnit = this.majorUnit;
    const seen      = this.seen;

    start = Math.max(start - (start % minorUnit) - majorUnit, 0);

    let flip = (start / minorUnit) % 2 ? 1 : -1;
    let feature, major, label;
    this.model.reset();
    for (let x = start; x < end + minorUnit; x += minorUnit) {
      flip *= -1;

      if (seen[x]) {
        continue;
      }

      seen[x] = 1;

      feature = { id: chr + ':' + x, chr: chr, strand: 1, sort: x };
      major   = x && x % majorUnit === 0;

      if (flip === 1) {
        feature.start = x;
        feature.end   = x + minorUnit - 1;
      }

      if (major) {
        label = this.view.formatLabel(x);

        if (label !== this.lastLabel) {
          feature.label = label;

          if (!feature.end) {
            feature.start = x;
            feature.end   = x - 1;
          }
        }

        this.lastLabel = label;
      }

      if (feature.end) {
        this.model.insertFeature(feature);
      }
    }
  };

  makeFirstImage(moveTo?: any): JQuery.Deferred<any, any, any> {
    if (this.strand === -1) {
      moveTo = this.forwardTrack.scrollStart;
    }
    return super.makeFirstImage(moveTo);
  };

  makeImage(params: any): any {
    params.background    = 'gv-guidelines gv-full-height';
    params.height = this.height;
    params.featureHeight = this.height;
    this.setFeatures(params.chr, params.start, params.end);
    const rtn = super.makeImage(params);
    params.container.addClass('gv-full-height');
    return rtn;
  }

  makeReverseImage(params: any): void {
    this.imgContainers.push(params.container.clone().html(params.container.children('.gv-data').clone(true).css({ opacity: 1, background: this.browser.wrapper.css('backgroundColor') }))[0]);
    this.scrollContainer.append(this.imgContainers);
  }

  renderBackground(f: any, bgImage: any, params: any) {
    bgImage.height(this.browser.wrapper.outerHeight(true));
    super.renderBackground(f, bgImage, params);
  }

  
  
}