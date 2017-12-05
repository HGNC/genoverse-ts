import * as $ from '../../node_modules/jquery/dist/jquery.js';
import Genoverse from './../genoverse';
import TrackModel from './model';
import TrackView from './view';

export default abstract class TrackController {
  repeatLabels: any;
  featureMargin: any;
  labels: string|boolean;
  invert: any;
  unsortable: any;
  border: any;
  featureHeight: number;
  id: any;
  imgContainers: any;
  labelPositions: any;
  legendType: any;
  name: string;
  disabled: boolean;
  lengthMap: any;
  _interface: any;
  _currentConfig: { prop: {}; func: {}; };
  resizable: string|boolean;
  initialHeight: any;
  margin: any;
  hideEmpty: any;
  defaultAutoHeight: any;
  autoHeight: boolean|string;
  height: any;
  defaultHeight: any;
  controls: any;
  defaultConfig: any;
  configSettings: any;
  config: any;
  legend: any;
  models: { [key: string]: TrackModel };
  model: TrackModel;
  views: {[key: string]: TrackView};
  view: TrackView;
  controller: any;
  stranded: any;
  expander: any;
  labelTop: any;
  fullVisibleHeight: number;
  thresholdMessage: any;
  scale: any;
  context: any;
  messageContainer: JQuery<HTMLElement>;
  imgContainer: JQuery<HTMLElement>;
  scrollContainer: JQuery<HTMLElement>;
  container: JQuery<HTMLElement>;
  menus: JQuery<HTMLElement>;
  minLabelHeight: number;
  label: any;
  labelName: any;
  width: number;
  scrollStart: string;
  left: number;
  browser: Genoverse;
  scrollRange: any;
  imgRange: any;
  deferreds: any[];
  scrollBuffer = 1.2;      // Number of widths, if left or right closer to the edges of viewpoint than the buffer, start making more images
  threshold = Infinity; // Length above which the track is not drawn
  clickTolerance = 0;        // pixels of tolerance added to a click position when finding features for popup menus, when scale < 1
  messages: any;

  abstract setEvents(): void;
  abstract createModel();
  abstract createView(properties?: Object);
  abstract init(): void;

  constructor(genoverse: Genoverse, properties?: any) {
    this.browser = genoverse;
    this.border = true;
    if(properties !== null && typeof properties === 'object'){
      $.extend(this, properties);
    }
  }
  
  setDefaults() {
    this.config = this.config || {};
    this.configSettings = this.configSettings || {};
    this.defaultConfig = this.defaultConfig || {};
    this.controls = this.controls || [];
    this.defaultHeight = this.height;
    this.defaultAutoHeight = this.autoHeight;
    this.autoHeight = typeof this.autoHeight !== 'undefined' ? this.autoHeight : this.browser.trackAutoHeight;
    this.hideEmpty = typeof this.hideEmpty !== 'undefined' ? this.hideEmpty : this.browser.hideEmptyTracks;
    this.height += this.margin;
    this.initialHeight = this.height;

    if (this.resizable === 'auto') {
      this.autoHeight = true;
    }

    this.imgRange = {};
    this.scrollRange = {};
    this.messages = this.messages || {
      error: 'ERROR: ',
      threshold: 'Data for this track is not displayed in regions greater than ',
      resize: 'Some features are currently hidden, <a class="gv-resize">resize to see all</a>'
    };

    this.setDefaultConfig();
  }

  setDefaultConfig() {
    for (const i in this.defaultConfig) {
      if (typeof this.config[i] === 'undefined') {
        this.config[i] = this.defaultConfig[i];
      }
    }
    this._setCurrentConfig();
  }

  _setCurrentConfig() {
    let settings: any = {};
    const featureFilters: any[] = [];
    let conf;

    this._currentConfig = { prop: {}, func: {} };

    for (const i in this.configSettings) {
      conf = this.getConfig(i);

      if (conf) {
        settings.push(conf);

        if (conf.featureFilter) {
          featureFilters.push(conf.featureFilter);
        }
      }
    }
    this.model.featureFilters = featureFilters;
    if (settings.length) {
      settings = $.extend.apply($, [true, {}].concat(settings, { featureFilters: featureFilters }));
      delete settings.featureFilter;
    }

    for (const i in settings) {
      this._currentConfig[typeof settings[i] === 'function' && !/^(before|after)/.test(i) ? 'func' : 'prop'][i] = settings[i];
    }
  }

  getConfig(type: string) {
    return this.configSettings[type][this.config[type]];
  }

  setHeight(height: number, forceShow: boolean) {
    if (this.disabled || (forceShow !== true && height < this.featureHeight) || (this.threshold) && !this.thresholdMessage && this.browser.length > this.threshold) {
      height = 0;
    } else {
      height = Math.max(height, this.minLabelHeight);
    }

    this.height = height;
    
    return height;
  }

  changeChr() {
    for (const i in this.models) {
      this.models[i].setChrProps();
    }
  }

  updateName(name: string) {
    this.setName(name); // For ease of use in external code
  }

  enable() {
    if (this.disabled === true) {
      this.disabled = false;
      this.resize(this.initialHeight);
      this.reset();
    }
  }

  disable() {
    if (!this.disabled) {
      this.disabled = true;
      this.resize(0);
    }
  }

  reset(type?: string) {
    //this.setLengthMap();

    for (const i in this.models) {
      if (this.models[i].url !== false) {
        this.models[i].init(true);
      }
    }

    for (const i in this.views) {
      this.views[i].init();
    }

    this.abort();
    this.setDefaults();
    this.resetImages();
    this.browser.closeMenus(this);

    if (type !== 'resizing') {
      this.setScale();
      this.makeFirstImage();
    }
  }

  remove() {
    this.browser.removeTrack(this);
  }

  destructor () {
    this.destroy();
    const view = this.view,
          model = this.model,
          controller = this;
    const objs = [ view, model, controller ];
    for(let i = 0; i< objs.length; i++){
      for (const key in objs[i]) {
        delete objs[i][key];
      }
    }
  }

  resetImages() {
    this.scrollContainer.empty();
    this.resetImageRanges();
  }

  resetImageRanges() {
    this.left = 0;
    this.scrollStart = ['ss', this.browser.chr, this.browser.start, this.browser.end].join('-');
    this.imgRange[this.scrollStart] = this.imgRange[this.scrollStart] || { left: this.width * -2, right: this.width * 2 };
    this.scrollRange[this.scrollStart] = this.scrollRange[this.scrollStart] || { start: this.browser.start - this.browser.length, end: this.browser.end + this.browser.length };
  }

  setName(name: string) {
    this.name = name;
    this.labelName = this.labelName || $('<span class="gv-name">').appendTo(this.label);

    this.labelName.attr('title', name).html(name);

    this.minLabelHeight = Math.max(this.labelName.outerHeight(true), this.labelName.outerHeight());

    if (this.minLabelHeight) {
      this.label.height(this.disabled ? 0 : Math.max(this.height, this.minLabelHeight));
    }
  }

  addDomElements() {
    const name = this.name || '';
    this.menus = $();
    this.container = $('<div class="gv-track-container">').appendTo(this.browser.wrapper);
    const classTag = name || 'Scalebar';
    this.container.addClass(`TRACK-${classTag}`);
    this.scrollContainer = $('<div class="gv-scroll-container">').appendTo(this.container);

    this.imgContainer = $('<div class="gv-image-container">').width(this.width).addClass(this.invert ? 'gv-invert' : '');
    this.messageContainer = $('<div class="gv-message-container"><div class="gv-messages"></div><span class="gv-control gv-collapse">&laquo;</span><span class="gv-control gv-expand">&raquo;</span></div>').appendTo(this.container);
    this.label = $('<li>').appendTo(this.browser.labelContainer).height(this.height).data('track', this);
    this.context = (<HTMLCanvasElement>$('<canvas>')[0]).getContext('2d');

    if (this.border) {
      $('<div class="gv-track-border">').appendTo(this.container);
    }
    if (this.unsortable) {
      this.label.addClass('gv-unsortable');
    } else {
      $('<div class="gv-handle">').appendTo(this.label);
    }

    this.setName(name);

    this.container.height(this.disabled ? 0 : Math.max(this.height, this.minLabelHeight));
  }

  addUserEventHandlers() {
    const controller = this;
    const browser = this.browser;

    this.container.on('mouseup', '.gv-image-container', function (e) {
      if ((e.which && e.which !== 1) || (typeof browser.dragStart === 'number' && browser.start !== browser.dragStart) || (browser.dragAction === 'select' && browser.selector.outerWidth(true) > 2)) {
        return; // Only show menus on left click when not dragging and not selecting
      }

      controller.click(e);
    });

    this.messageContainer.children().on('click', function () {
      const collapsed = controller.messageContainer.children('.gv-messages').is(':visible') ? ' gv-collapsed' : '';
      const code = controller.messageContainer.find('.gv-msg').data('code');

      controller.messageContainer.attr('class', 'gv-message-container' + collapsed);
      controller.checkHeight();

      if (code !== 'error') {
        document.cookie = ['gv_msg', code, controller.id].join('_') + '=1; expires=' + (collapsed ? 'Tue, 19 Jan 2038' : 'Thu, 01 Jan 1970') + ' 00:00:00 GMT; path=/';
      }
    });
  }

  click(e: any) {
    const target = $(e.target);
    const x = e.pageX - this.container.parent().offset().left + this.browser.scaledStart;
    let y = e.pageY - target.offset().top;

    if (this.imgContainer.hasClass('gv-invert')) {
      y = target.height() - y;
    }

    return this.browser.makeMenu(this.getClickedFeatures(x, y, target), e, this);
  }

  getClickedFeatures(x: any, y: any, target?: any) {
    const bounds = { x: x, y: y, w: 1, h: 1 };
    const scale = this.scale;
    const tolerance = scale < 1 ? this.clickTolerance : 0;

    if (tolerance) {
      bounds.x -= tolerance / 2;
      bounds.w += tolerance;
    }

    const features = (<any>this)[target && target.hasClass('gv-labels') ? 'labelPositions' : 'featurePositions'].search(bounds);

    if (tolerance) {
      return features.sort(function (a: any, b: any) { return Math.abs(a.position[scale].start - x) - Math.abs(b.position[scale].start - x); });
    } else {
      return this.model.sortFeatures(features);
    }
  }

  // FIXME: messages are now hidden/shown instead of removed/added. This will cause a problem if a new message arrives with the same code as one that already exists.
  showMessage(code: any, additionalText?: string) {
    let messages = this.messageContainer.children('.gv-messages');

    if (!messages.children('.gv-' + code).show().length) {
      const msg = $('<div class="gv-msg gv-' + code + '">' + this.messages[code] + (additionalText || '') + '</div>').data('code', code).prependTo(messages);

      if (code === 'resize') {
        msg.children('a.gv-resize').on('click', $.proxy(function () {
          this.resize(this.fullVisibleHeight);
        }, this));
      }

      this.messageContainer[document.cookie.match(['gv_msg', code, this.id].join('_') + '=1') ? 'addClass' : 'removeClass']('gv-collapsed');
    }

    const height = this.messageContainer.show().outerHeight(true);

    if (height > this.height) {
      this.resize(height, undefined, false);
    }

    messages = null;
  }

  hideMessage(code?: string) {
    let messages = this.messageContainer.find('.gv-msg');

    if (code) {
      messages = messages.filter('.gv-' + code).hide();

      if (messages.length && !messages.siblings().filter(function () { return this.style.display !== 'none'; }).length) {
        this.messageContainer.hide();
      }
    } else {
      messages.hide();
      this.messageContainer.hide();
    }

    messages = null;
  }

  showError(error: any) {
    this.showMessage('error', error);
  }

  checkHeight() {
    if (this.browser.length > this.threshold) {
      if (this.thresholdMessage) {
        this.showMessage('threshold', this.thresholdMessage);
        this.fullVisibleHeight = Math.max(this.messageContainer.outerHeight(true), this.minLabelHeight);
      } else {
        this.fullVisibleHeight = 0;
      }
    } else if (this.thresholdMessage) {
      this.hideMessage('threshold');
    }

    if (!this.resizable) {
      return;
    }

    let autoHeight;

    if (this.browser.length > this.threshold) {
      autoHeight = this.autoHeight;
      this.autoHeight = true;
    } else {
      this.fullVisibleHeight = this.visibleFeatureHeight() || (this.messageContainer.is(':visible') ? this.messageContainer.outerHeight(true) : this.hideEmpty ? 0 : this.minLabelHeight);
    }

    this.autoResize();

    if (typeof autoHeight !== 'undefined') {
      this.autoHeight = autoHeight;
    }
  }

  visibleFeatureHeight() {
    const bounds = { x: this.browser.scaledStart, w: this.width, y: 0, h: 9e99 };
    const scale = this.scale;

    const features = this.view.scaleSettings[this.browser.chr][this.scale].featurePositions.search(bounds);

    const minHeight = this.hideEmpty ? 0 : this.minLabelHeight;
    
    let height = Math.max.apply(Math, $.map(features, (feature) => {
      return feature.position[scale].bottom;
    }).concat(minHeight));

    if (this.labels === 'separate') {
      this.labelTop = height;
      height += Math.max.apply(Math, $.map(this.labelPositions.search(bounds).concat(this.repeatLabels ? features : []), function (feature) { return feature.position[scale].label.bottom; }).concat(minHeight));
    }

    return height;
  }

  autoResize() {
    const autoHeight = this.autoHeight;

    if (autoHeight || this.labels === 'separate') {
      this.resize(autoHeight ? this.fullVisibleHeight : this.height, this.labelTop, false);
    } else {
      this.toggleExpander(false);
    }
  }

  resize(height: number, arg?: any, saveConfig?: any) {
    height = this.setHeight(height, arg);

    if (typeof arg === 'number') {
      this.view.scaleSettings.imgContainers.children('.gv-labels').css('top', arg);
    }

    this.container.add(this.label).height(height)[height ? 'show' : 'hide']();
    this.toggleExpander();

    if (saveConfig !== false) {
      this.browser.saveConfig();
    }
  }

  toggleExpander(saveConfig?: any) {
    if (this.resizable !== true) {
      return;
    }

    const featureMargin = this.view.featureMargin;
    const height = this.height;

    // Note: fullVisibleHeight - featureMargin.top - featureMargin.bottom is not actually the correct value to test against, but it's the easiest best guess to obtain.
    // fullVisibleHeight is the maximum bottom position of the track's features in the region, which includes margin at the bottom of each feature and label
    // Therefore fullVisibleHeight includes this margin for the bottom-most feature.
    // The correct value (for a track using the default positionFeatures code) is:
    // fullVisibleHeight - ([there are labels in this region] ? (labels === 'separate' ? 0 : featureMargin.bottom + 1) + 2 : featureMargin.bottom)
    if (this.fullVisibleHeight - featureMargin.top - featureMargin.bottom > height && !this.disabled) {
      this.showMessage('resize');

      const controller = this;
      const h = this.messageContainer.outerHeight(true);

      if (h > height) {
        this.resize(h, undefined, saveConfig);
      }

      this.expander = (this.expander || $('<div class="gv-expander gv-static">').width(this.width).appendTo(this.container).on('click', function () {
        controller.resize(controller.fullVisibleHeight);
      }))[this.height === 0 ? 'hide' : 'show']();
    } else if (this.expander) {
      this.hideMessage('resize');
      this.expander.hide();
    }
  }

  setWidth(width: number) {
    const track = this;

    $.each([this, track.model, track.view], function () {
      this.width = width;
    });

    this.imgContainer.add(this.expander).width(width);
  }

  setScale() {
    const controller = this;

    this.scale = this.browser.scale;
    
    //this.setMVC();
    this.resetImageRanges();
    
    const labels = this.labels;

    if (labels && labels !== 'overlay') {
      this.model.setLabelBuffer(this.browser.labelBuffer);
    }
    
    if (this.threshold !== Infinity && this.resizable !== 'auto') {
      this.thresholdMessage = this.view.formatLabel(this.threshold);
    }
    $.each(this.view.setScaleSettings(this.scale), (k, v) => {
      (<any>controller)[k] = v;
    });
    this.hideMessage();
    
  }

  move(delta: number[]) {
    var sum = delta.reduce((a, b) => a + b, 0);
    this.left += sum;
    this.scrollContainer.css('left', this.left);
    const scrollStart = this.scrollStart;

    if (this.imgRange[scrollStart] && this.imgRange[scrollStart].left + this.left > -this.scrollBuffer * this.width) {
      const end = this.scrollRange[scrollStart].start - 1;
      this.makeImage({
        scale: this.scale,
        chr: this.browser.chr,
        start: end - this.browser.length + 1,
        end: end,
        left: this.imgRange[scrollStart].left,
        cls: scrollStart
      });

      (this.imgRange[scrollStart] || {}).left -= this.width;
      (this.scrollRange[scrollStart] || {}).start -= this.browser.length;
    }
    
    if (this.imgRange[scrollStart] && this.imgRange[scrollStart].right + this.left < this.scrollBuffer * this.width) {
      const start = this.scrollRange[scrollStart].end + 1;
      this.makeImage({
        scale: this.scale,
        chr: this.browser.chr,
        start: start,
        end: start + this.browser.length - 1,
        left: this.imgRange[scrollStart].right,
        cls: scrollStart
      });

      (this.imgRange[scrollStart] || {}).right += this.width;
      (this.scrollRange[scrollStart] || {}).end += this.browser.length;
    }
  }

  moveTo(chr: string, start: number, end: number, delta: number) {
    const scrollRange = this.scrollRange[this.scrollStart];
    const scrollStart = ['ss', chr, start, end].join('-');

    if (this.scrollRange[scrollStart] || start > scrollRange.end || end < scrollRange.start) {
      this.resetImageRanges();
      this.makeFirstImage(scrollStart);
    } else {
      let d;
      if(typeof delta === 'number'){
        d = [delta];
      } else {
        const tmp = (start - this.browser.start) * this.scale;
        d = [tmp];
      }
      this.move(d);
      this.checkHeight();
    }
  }

  makeImage(myParams: any): JQuery.Deferred<any, any, any> {
    myParams.scaledStart = myParams.scaledStart || myParams.start * myParams.scale;
    myParams.width = this.width;
    myParams.margin = 1;
    myParams.height = this.height;
    myParams.featureHeight = myParams.featureHeight || 0;
    myParams.labelHeight = myParams.labelHeight || 0;
    let deferred;
    const controller = this;
    const tooLarge = this.browser.length > this.threshold;
    const div = this.imgContainer.clone().addClass((myParams.cls + ' gv-loading').replace('.', '_')).css({ left: myParams.left, display: myParams.cls === this.scrollStart ? 'block' : 'none' });
    
    const bgImage = myParams.background ? $('<img class="gv-bg">').hide().addClass(myParams.background).prependTo(div) : false;
    const image = $('<img class="gv-data">').hide().appendTo(div).on('load', function () {
      $(this).fadeIn('fast').parent().removeClass('gv-loading');
      $(this).siblings('.gv-bg').show();
    });
    

    myParams.container = div;

    this.imgContainers.push(div[0]);
    this.scrollContainer.append(this.imgContainers);

    if (!tooLarge && !this.model.checkDataRange(myParams.chr, myParams.start, myParams.end)) {
      const buffer = this.model.dataBuffer;

      myParams.start -= buffer.start;
      myParams.end += buffer.end;
      deferred = this.model.getData(myParams.chr, myParams.start, myParams.end);
    }

    if (!deferred) {
      deferred = $.Deferred();
      setTimeout($.proxy(deferred.resolve, this), 1); // This defer makes scrolling A LOT smoother, pushing render call to the end of the exec queue
    }

    this.deferreds.push(deferred);
    return deferred.done(function () {
      const features = tooLarge ? [] : controller.model.findFeatures(myParams.chr, myParams.start, myParams.end);
      controller.render(features, image, myParams);
      if (bgImage) {
        controller.renderBackground(features, bgImage, myParams);
      }
      
    }).fail(function (e: any) {
      controller.showError(e);
    });
  }

  makeFirstImage(moveTo?: any): JQuery.Deferred<any, any, any> {
    const deferred = $.Deferred();
    if (this.scrollContainer.children().hide().filter('.' + (moveTo || this.scrollStart)).show().length) {
      this.scrollContainer.css('left', 0);
      this.checkHeight();

      return deferred.resolve();
    }

    const controller = this;
    const chr = this.browser.chr;
    const start = this.browser.start;
    const end = this.browser.end;
    const length = this.browser.length;
    const scale = this.scale;
    const cls = this.scrollStart;
    const images = [{ chr: chr, start: start, end: end, scale: scale, cls: cls, left: 0 }];
    let left = 0;
    let width = this.width;

    if (!this.browser.isStatic) {
      if (start > 1) {
        images.push({ chr: chr, start: start - length, end: start - 1, scale: scale, cls: cls, left: -this.width});
        left = -this.width;
        width += this.width;
      }

      if (end < this.browser.getChromosomeSize(chr)) {
        images.push({ chr: chr, start: end + 1, end: end + length, scale: scale, cls: cls, left: this.width });
        width += this.width;
      }
    }

    const loading = this.imgContainer.clone().addClass('gv-loading').css({ left: left, width: width }).prependTo(this.scrollContainer.css('left', 0));

    const makeImages = () => {
      $.when.apply($, images.map(function (image) {
        return controller.makeImage(image);
      })).done(deferred.resolve);

      loading.remove();
    }


    if (length > this.threshold || this.model.checkDataRange(chr, start, end)) {
      makeImages();
    } else {
      const buffer = this.model.dataBuffer;
      this.model.getData(chr, start - buffer.start - length, end + buffer.end + length).done(makeImages).fail(function (e) {
        controller.showError(e);
      });
    }

    return deferred;
  }

  render(features: any, img: any, params: any) {
    
    features = this.view.positionFeatures(this.view.scaleFeatures(features, params.scale), params); // positionFeatures alters params.featureHeight, so this must happen before the canvases are created

    let featureCanvas = $('<canvas>').attr({ width: params.width, height: params.featureHeight || 1 });
    let labelCanvas = this.labels === 'separate' && params.labelHeight ? featureCanvas.clone().attr('height', params.labelHeight) : featureCanvas;
    const featureContext = (<HTMLCanvasElement>featureCanvas[0]).getContext('2d');
    const labelContext = (<HTMLCanvasElement>labelCanvas[0]).getContext('2d');

    featureContext.font = labelContext.font = this.view.font;

    switch (this.labels) {
      case false: break;
      case 'overlay': labelContext.textAlign = 'center'; labelContext.textBaseline = 'middle'; break;
      default: labelContext.textAlign = 'left'; labelContext.textBaseline = 'top'; break;
    }
    
    
    this.view.draw(features, featureContext, labelContext, params.scale);


    img.attr('src', (<HTMLCanvasElement>featureCanvas[0]).toDataURL());
    if (labelContext !== featureContext) {
      img.clone(true).attr({ 'class': 'gv-labels', src: (<HTMLCanvasElement>labelCanvas[0]).toDataURL() }).insertAfter(img);
    }

    this.checkHeight();

    featureCanvas = labelCanvas = img = null;
  }

  renderBackground(features: any, img: any, params: any, height?: number) {
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>$('<canvas>').attr({ width: this.width, height: height || 1 })[0];
    this.view.drawBackground(features, canvas.getContext('2d'), params);
    img.attr('src', canvas.toDataURL());
    canvas = img = null;
  }

  populateMenu(feature: any) {
    const f = $.extend(true, {}, feature);
    const menu = {
      title: f.label ? f.label[0] : f.id,
      Location: f.chr + ':' + f.start + '-' + f.end
    };

    delete f.chr;
    delete f.start;
    delete f.end;
    delete f.sort;

    for (const i in f) {
      if (typeof f[i] === 'object' || menu.title === f[i]) {
        delete f[i];
      }
    }

    return $.extend(menu, f);
  }

  abort() {
    for (let i = 0; i < this.deferreds.length; i++) {
      if (this.deferreds[i].state() === 'pending') {
        this.deferreds[i].reject();
      }
    }

    this.deferreds = [];
  }

  destroy() {
    this.abort();
    this.container.add(this.label).add(this.menus).remove();
  }
}