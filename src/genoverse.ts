import * as $ from 'jquery';
import 'jquery-ui-dist/jquery-ui';
import RTree from 'rtree';
import karyotype from './plugins/karyotype';
import tooltips from './plugins/tooltips';
import trackControls from './plugins/trackControls';
import GRCh37 from './interfaces/genomes/grch37';
import GRCh38 from './interfaces/genomes/grch38';
import controlPanel from './plugins/controlPanel';
import Genome from "./interfaces/genome";
import { Chromosomes } from "./interfaces/genome";

export default class Genoverse {
  type?: string;
  viewPoint: JQuery<HTMLElement>;
  hideTooltip: boolean;
  parent?: Genoverse;
  controls: any;
  focusRegion: any;
  failed: boolean;
  labelBuffer: number;
  scaledStart: number;
  canChangeChr: any;
  length: number;
  maxLeft: number;
  minLeft: number;
  selectorStart: number;
  selectorStalled: boolean;
  scrollDelta: number;
  dragOffset: number;
  left: number;
  dragStart: number;
  dragging: string;
  scrolling: boolean;
  zoomTimeout: number;
  zoomDeltaTimeout: number;
  superContainer: any;
  controlPanel: any;
  scale: number;
  noWheelZoom: boolean;
  wheelTimeout: number;
  zoomOutHighlight: any;
  zoomInHighlight: any;
  selectorControls: any;
  selector: any;
  container: string|JQuery<HTMLElement> = '#genoverse';
  wrapper: any;
  labelContainer: any;
  menus: any;
  _constructing: boolean;
  urlParamTemplate   = 'r=__CHR__:__START__-__END__'; // Overwrite this for your URL style
  width              = 1000;
  longestLabel       = 30;
  defaultLength      = 5000;
  defaultScrollDelta = 100;
  tracks: any[] = [];
  highlights: any[] = [];
  plugins: any[] = [];
  dragAction         = 'scroll';         // Options are: scroll, select, off
  wheelAction        = 'off';            // Options are: zoom, off
  isStatic           = false;            // If true, will stop drag, select and zoom actions occurring
  saveable           = false;            // If true, track configuration and ordering will be saved in sessionStorage/localStorage
  saveKey            = '';               // Default key for sessionStorage/localStorage configuration is 'genoverse'. saveKey will be appended to this if it is set
  storageType        = 'sessionStorage'; // Set to localStorage for permanence
  autoHideMessages   = true;             // Determines whether to collapse track messages by default
  trackAutoHeight    = false;            // Determines whether to automatically resize tracks to show all their features (can be overridden by track.autoHeight)
  hideEmptyTracks    = true;             // Determines whether to hide an automatically resized tracks if it has no features, or to show it empty (can be overridden by track.hideEmpty)
  genome: string|Chromosomes = 'grch38';        // The genome used in the browser - can be an object or a string, which will be used to obtain a javascript file
  useHash = false;        // If true, window.location.hash is changed on navigation. If false, window.history.pushState is used. If undefined, pushState will be used if present in the browser
  // Default coordinates for initial view, overwrite in your config
  chr   = '1';
  start = 1;
  end   = 1000000;
  assembly: string;
  eventNamespace: string;
  events: any;
  loadedPlugins: any;
  tracksById: any;
  prev: any;
  legends: any;
  textWidth: number;
  labelWidth: number; 
  paramRegex: RegExp;
  chromosomeSize: number;
  defaultTracks: any;
  trackIds: any;
  savedConfig: any;
  tracksLoaded: boolean;

  menuTemplate: any = $(
    `<div class="gv-menu">
      <div class="gv-close gv-menu-button fa fa-times-circle"></div>
      <div class="gv-menu-loading">Loading...</div>
      <div class="gv-menu-content">
        <div class="gv-title"></div>
        <table></table>
      </div>
    </div>`
  ).on('click', function (e: any) {
    if ($(e.target).hasClass('gv-close')) {
      $(this).fadeOut('fast', function () {
        const data = $(this).data();

        if (data.track) {
          data.track.menus = data.track.menus.not(this);
        }

        data.browser.menus = data.browser.menus.not(this);
      });
    }
  });

  public static id = 0; // USED
  public static Genomes: {[key: string]: any} = { // USED
    grch37: GRCh37,
    grch38: GRCh38
  };
  public static Plugins: any = { // USED
    controlPanel: controlPanel,
    tooltips: tooltips,
    trackControls: trackControls,
    karyotype: karyotype
  };

  private static supported(): boolean { // USED
    const el = document.createElement('canvas');
    return !!(el.getContext && el.getContext('2d'));
  }

  private static wrapFunctions(obj) {
    for (var key in obj) {
      if (typeof obj[key] === 'function' && typeof obj[key].ancestor !== 'function' && !key.match(/^(base|extend|constructor|on|once|prop|loadPlugins|loadGenome)$/)) {
        Genoverse.functionWrap(key, obj);
      }
    }
  }

  private static functionWrap(key, obj) {

    obj.functions = obj.functions || {};

    if (obj.functions[key] || /^(before|after)/.test(key)) {
      return;
    }

    const func      = key.substring(0, 1).toUpperCase() + key.substring(1);
    const mainObj   = obj
    const events    = obj.events.browser;

    obj.functions[key] = obj[key];
    obj[key] = function () {
      const args          = [].slice.call(arguments);
      let rtn;

      function trigger(when) {
        const once  = events[when + func + '.once'] || [];
        const funcs = (events[when + func] || []).concat(once, typeof mainObj[when + func] === 'function' ? mainObj[when + func] : []);

        if (once.length) {
          delete events[when + func + '.once'];
        }

        for (var i = 0; i < funcs.length; i++) {
          funcs[i].apply(this, args);
        }
      }

      trigger.call(this, 'before');
      rtn = this.functions[key].apply(this, args);
      trigger.call(this, 'after');
      return rtn;
    };
  }

  constructor(config?: any, type?: string) { // USED
    const browser = this;
    this.type = type;
    this.tracksLoaded = false;
    if (!Genoverse.supported()) {
      this.die('Your browser does not support this functionality');
    }
    config = config || {};

    config.container = $(config.container); // Make sure container is a jquery object, jquery recognises itself automatically

    if (!(config.container && config.container.length)) {
      config.container = $('<div>').appendTo('body');
    }

    config.container.addClass('genoverse').data('genoverse', this);
    $.extend(this, config);

    this.eventNamespace = '.genoverse.' + (++Genoverse.id);
    this.events         = { browser: {}, tracks: {} };
    this.loadGenome();
    this.loadPlugins();
    Genoverse.wrapFunctions(this);
    this.init();
  }

  loadGenome(): void { // USED
    if (typeof this.genome === 'string') {
      const genomeName: string = <string>this.genome;
      const Genome = Genoverse.Genomes[genomeName];
      const gm = new Genome;
      this.genome = gm.chromosomes;
    }
  }

  loadPlugins(plugins?: string[]) { // USED
    const browser         = this;
    plugins = plugins || this.plugins;
    this.loadedPlugins = this.loadedPlugins || {};

    for (const i in Genoverse.Plugins) {
      this.loadedPlugins[i] = this.loadedPlugins[i] || 'script';
    }

    function loadPlugin(plugin: string) {
      Genoverse.Plugins[plugin].create.call(browser);
    }

    function initializePlugin(plugin: string): void {
      if (typeof Genoverse.Plugins[plugin].create !== 'function' || browser.loadedPlugins[plugin] === true) {
        return;
      }

      const requires = Genoverse.Plugins[plugin].requires;

      function init() {
        if (browser.loadedPlugins[plugin] !== true) {
          Genoverse.Plugins[plugin].create.call(browser);
          (<JQuery>browser.container).addClass('gv-' + plugin.replace(/([A-Z])/g, '-$1').toLowerCase() + '-plugin');
          browser.loadedPlugins[plugin] = true;
        }
      }

      if (Boolean(requires) && requires.length) {
        
        let newPlugin = false;
        for(let i = 0; i < requires.length; i++){
          if(plugins.indexOf(requires[i]) < 0){
            newPlugin = true;
            plugins.push(requires[i]);    
          }
        }
        if (newPlugin) browser.loadPlugins(plugins);
        
      }
      init();
    }

    // Load plugins css file
    $.map(plugins, loadPlugin);
    
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i];
      if (browser.loadedPlugins[plugin] !== true) {
        initializePlugin(plugin);
      }
    }
  }

  init() { // USED
    this.tracksById       = {};
    this.prev             = {};
    this.legends          = {};
    const width = this.width;
    this.addDomElements(width);
    this.addUserEventHandlers();
    if (this.isStatic) {
      this.dragAction       = this.wheelAction = 'off';
      this.urlParamTemplate = '';
    }
    
    this.saveKey          = this.saveKey ? 'genoverse-' + this.saveKey : 'genoverse';
    this.urlParamTemplate = this.urlParamTemplate || '';
    this.useHash          = typeof this.useHash === 'boolean' ? this.useHash : typeof window.history.pushState !== 'function';
    this.textWidth        = document.createElement('canvas').getContext('2d').measureText('W').width;
    this.paramRegex       = this.urlParamTemplate !== '' ? new RegExp('([?&;])' + this.urlParamTemplate
      .replace(/(\b(\w+=)?__CHR__(.)?)/,   '$2([\\w\\.]+)$3')
      .replace(/(\b(\w+=)?__START__(.)?)/, '$2(\\d+)$3')
      .replace(/(\b(\w+=)?__END__(.)?)/,   '$2(\\d+)$3') + '([;&])'
    ) : new RegExp('');
    
    const urlCoords = this.getURLCoords();
    const coords    = urlCoords.chr && urlCoords.start && urlCoords.end ? urlCoords : { chr: this.chr, start: this.start, end: this.end };

    this.chr = coords.chr;

    if (this.genome) {
      this.chromosomeSize = (<Chromosomes>this.genome)[this.chr].size;
    }

    this.canChangeChr = !!this.genome;
    this.setRange(coords.start, coords.end);  
  }

  loadConfig() { // USED
    this.defaultTracks = $.extend([], true, this.tracks);
    let config = (<any>window)[ this.storageType ].getItem(this.saveKey);
    if (config) {
      config = JSON.parse(config);
    } else {
      return this.addTracks();
    }

    const tracks: any[] = [];
    const tracksById: any = {};
    const savedConfig: any  = {};
    let i, prop, track;

    function setConfig(track: any, conf: any) {
      for (prop in conf) {
        if (prop === 'config') {
          savedConfig[conf.id] = conf[prop];
        } else {
          track.prototype[prop] = conf[prop];
        }
      }
    }
    
    for (i = 0; i < this.tracks.length; i++) {
      if (this.tracks[i].prototype.id) {
        tracksById[this.tracks[i].prototype.id] = this.tracks[i];
      }
    }
    
    for (i = 0; i < this.tracks.length; i++) {
      if (this.tracks[i].prototype.id && !this.tracks[i]._fromStorage) {
        continue;
      }

      tracks.push(this.tracks[i]);
    }

    this.tracks      = tracks;
    this.savedConfig = savedConfig;

    this.addTracks();
  }

  saveConfig() {
    if (this._constructing || !this.saveable) {
      return;
    }

    const config: any[] = [];
    // Safari in private browsing mode does not allow writes to storage, so wrap in a try/catch to stop errors occuring
    try {
      (<any>window)[this.storageType].setItem(this.saveKey, JSON.stringify(config));
    } catch (e) {}
  }

  resetConfig () {
    // Non removable highlights should be re-added after reset
    var unremovableHighlights = [];

    if (this.tracksById.highlights) {
      this.tracksById.highlights.removeHighlights();
      unremovableHighlights = $.map(this.tracksById.highlights.featuresById, function (h: any) { return h; });
    }

    (<any>window)[this.storageType].removeItem(this.saveKey);

    this._constructing = true;
    this.savedConfig   = {};
    this._constructing = false;
  }

  addDomElements(width: number) { // USED
    this.menus          = $();
    this.labelContainer = $('<ul class="gv-label-container">').addClass('WIBBLE').appendTo(this.container).sortable({
      items  : 'li:not(.gv-unsortable)',
      handle : '.gv-handle',
      axis   : 'y',
      helper : 'clone',
      cursor : 'move',
      start  : function (e: any, ui: any) {
        ui.placeholder.css({ height: ui.item.height(), visibility: 'visible' }).html(ui.item.html());
        ui.helper.hide();
      }
    });
    this.labelWidth       = this.labelContainer.outerWidth(true);
    this.width           -= this.labelWidth;
    this.wrapper  = $('<div class="gv-wrapper">').appendTo(this.container);
    this.selector = $('<div class="gv-selector gv-crosshair">').appendTo(this.wrapper);
    this.selectorControls = this.zoomInHighlight = this.zoomOutHighlight = $();
    (<JQuery<HTMLElement>>this.container).addClass('gv-canvas-container').width(width);
    if (!this.isStatic) {
      this.selectorControls = $(
        '<div class="gv-selector-controls gv-panel">'         +
        '  <div class="gv-button-set">'                       +
        '  <div class="gv-position">'                         +
        '    <div class="gv-chr"></div>'                      +
        '    <div class="gv-start-end">'                      +
        '      <div class="gv-start"></div>'                  +
        '      <div class="gv-end"></div>'                    +
        '    </div>'                                          +
        '  </div>'                                            +
        '  </div>'                                            +
        '  <div class="gv-button-set">'                       +
        '    <button class="gv-zoom-here">Zoom here</button>' +
        '  </div>'                                            +
        '  <div class="gv-button-set">'                       +
        '    <button class="gv-center">Center</button>'       +
        '  </div>'                                            +
        '  <div class="gv-button-set">'                       +
        '    <button class="gv-highlight">Highlight</button>' +
        '  </div>'                                            +
        '  <div class="gv-button-set">'                       +
        '    <button class="gv-cancel">Cancel</button>'       +
        '  </div>'                                            +
        '</div>'
      ).appendTo(this.selector);
      this.zoomInHighlight = $(
        '<div class="gv-canvas-zoom gv-i">' +
        '  <div class="gv-t gv-l gv-h"></div>' +
        '  <div class="gv-t gv-r gv-h"></div>' +
        '  <div class="gv-t gv-l gv-v"></div>' +
        '  <div class="gv-t gv-r gv-v"></div>' +
        '  <div class="gv-b gv-l gv-h"></div>' +
        '  <div class="gv-b gv-r gv-h"></div>' +
        '  <div class="gv-b gv-l gv-v"></div>' +
        '  <div class="gv-b gv-r gv-v"></div>' +
        '</div>'
      ).appendTo('body');
      this.zoomOutHighlight = this.zoomInHighlight.clone().toggleClass('gv-i gv-o').appendTo('body');
      
    }

    if(! this.tracksLoaded && this.tracks){
      for(let i=0; i<this.tracks.length; i++){
        this.tracks[i] = new this.tracks[i](this);
      }
      this.tracksLoaded = true;
    }
  }

  addUserEventHandlers() { // USED
    var browser        = this;
    var documentEvents = {};

    (<JQuery<HTMLElement>>this.container).on({
      mousedown: function (e: any) {
        browser.hideMessages();

        // Only scroll on left click, and do nothing if clicking on a button in selectorControls
        if ((!e.which || e.which === 1) && !(this === browser.selector[0] && e.target !== this)) {
          browser.mousedown(e);
        }

        return false;
      },
      mousewheel: function (e: any, delta: number, deltaX: number, deltaY: number) {
        if (browser.noWheelZoom) {
          return true;
        }

        browser.hideMessages();

        if (deltaY === 0 && deltaX !== 0) {
          browser.startDragScroll(e);
          browser.move(-deltaX * 10);
          browser.stopDragScroll(false);
        }
      },
      dblclick: function (e: any) {
        if (browser.isStatic) {
          return true;
        }

        browser.hideMessages();
      }
    }, '.gv-image-container, .gv-selector');

    this.selectorControls.on('click', function (e: any) {
      var pos = browser.getSelectorPosition();

      switch (e.target.className) {
        case 'gv-zoom-here' : browser.setRange(pos.start, pos.end, true); break;
        case 'gv-center'    : browser.moveTo(browser.chr, pos.start, pos.end, true, true); browser.cancelSelect(); break;
        //case 'gv-highlight' : browser.addHighlight({ chr: browser.chr, start: pos.start, end: pos.end });
        case 'gv-cancel'    : browser.cancelSelect(); break;
        default             : break;
      }
    });

    (<any>documentEvents)['mouseup'    + this.eventNamespace] = $.proxy(this.mouseup,   this);
    (<any>documentEvents)['mousemove'  + this.eventNamespace] = $.proxy(this.mousemove, this);
    $(document).on(documentEvents);
    $(window).on((this.useHash ? 'hashchange' : 'popstate') + this.eventNamespace, $.proxy(this.popState, this));
  }

  onTracks(key: any, value1?: any, value2?: any, value3?: any, value4?: any) { 
    
    if(! this.tracksLoaded && this.tracks){
      for(let i=0; i<this.tracks.length; i++){
        this.tracks[i] = new this.tracks[i](this);
      }
      this.tracksLoaded = true;
    }
    let args = $.extend([], arguments);
    const func = args.shift();
    if (args.length === 0){
      args = undefined;
    }
    //let mvc;
    const len: number = this.tracks ? this.tracks.length : 0;
    for (let i = 0; i < len; i++) {
      if (this.tracks[i].disabled) {
        continue;
      }
      this.tracks[i][func](args);
    }
  }

  reset(type?: string) {
    this.onTracks.apply(this, [ 'reset' ].concat([].slice.call(arguments)));
    this.prev  = {};
    this.scale = 9e99; // arbitrary value so that setScale resets track scales as well
    this.setRange(this.start, this.end);
  }

  setWidth(width: number) {
    this.width  = width;
    this.width -= this.labelWidth;

    if (this.controlPanel) {
      this.width -= this.controlPanel.width();
    }

    if (this.superContainer) {
      this.superContainer.width(width);
      (<JQuery<HTMLElement>>this.container).width(this.width);
    } else {
      (<JQuery<HTMLElement>>this.container).width(width);
    }

    this.onTracks('setWidth', this.width);
    this.reset('resizing');
  }

  startDragScroll(e?: any) { // USED
    this.dragging    = 'scroll';
    this.scrolling   = !e;
    this.dragOffset  = e ? e.pageX - this.left : 0;
    this.dragStart   = this.start;
    this.scrollDelta = Math.max(this.scale, this.defaultScrollDelta);
  }

  stopDragScroll(update?: boolean) {
    this.dragging  = undefined;
    this.scrolling = false;

    if (update !== false) {
      if (this.start !== this.dragStart) {
        this.updateURL();
      }
      this.checkTrackHeights();
    }
    
    for (let index = 0; index < this.tracks.length; index++) {
      if (typeof this.tracks[index].addLegend === "function") { 
        this.tracks[index].addLegend();
      }
    }
  }

  cancelSelect(keepDragging?: boolean) { // USED
    this.selector.hide();
  };

  mousedown(e: any) { // USED
    switch (this.dragAction) {
      case 'scroll' : this.startDragScroll(e); break;
      default       : break;
    }
  }

  mouseup(e: any) {
    if (!this.dragging) {
      return false;
    }

    switch (this.dragging) {
      case 'scroll' : this.stopDragScroll();  break;
      default       : break;
    }
  }

  mousemove(e: any) {
    if (this.dragging && !this.scrolling) {
      switch (this.dragAction) {
        case 'scroll' : this.move(e.pageX - this.dragOffset - this.left); break;
        default       : break;
      }
    }
  }

  moveSelector(e: any) { // USED
    if (!this.selectorStalled) {
      this.selector.css('left', e.pageX - this.wrapper.offset().left - 2);
    }
  }

  move(delta: number) {
    const scale = this.scale;
    let start, end, left;
    if (scale > 1) {
      delta = Math.round(delta / scale) * scale; // Force stepping by base pair when in small regions
    }

    left = this.left + delta;

    if (left <= this.minLeft) {
      left  = this.minLeft;
      delta = this.minLeft - this.left;
    } else if (left >= this.maxLeft) {
      left  = this.maxLeft;
      delta = this.maxLeft - this.left;
    }

    start = Math.max(Math.round(this.start - delta / scale), 1);
    end   = start + this.length - 1;

    if (end > this.chromosomeSize) {
      end   = this.chromosomeSize;
      start = end - this.length + 1;
    }

    this.left = left;

    if (start !== this.dragStart) {
      this.closeMenus();
      this.cancelSelect(true);
    }

    this.onTracks('move', delta);
    this.setRange(start, end);
  }

  moveTo(chr: string, start: number, end: number, update?: boolean, keepLength?: boolean) {
    if (typeof chr !== 'undefined' && chr != this.chr) {
      if (this.canChangeChr) {
        if (this.genome && (<Chromosomes>this.genome)[chr]) {
          this.chr            = chr;
          this.chromosomeSize = (<Chromosomes>this.genome)[chr].size;
          this.start          = this.end = this.scale = -1;
        } else {
          this.die('Chromosome cannot be found in genome');
        }

        this.onTracks('changeChr');
      } else {
        this.die('Chromosome changing is not allowed');
      }
    }

    this.setRange(start, end, update, keepLength);

    if (this.prev.scale === this.scale) {
      this.left = Math.max(Math.min(this.left + Math.round((this.prev.start - this.start) * this.scale), this.maxLeft), this.minLeft);
      this.onTracks('moveTo', this.chr, this.start, this.end, (this.prev.start - this.start) * this.scale);
    }
  }

  setRange(start: number, end: number, update?: boolean, keepLength?: boolean) { // USED
    
    this.prev.start = this.start;
    this.prev.end   = this.end;
    this.start      = Math.min(Math.max(typeof start === 'number' ? Math.floor(start) : parseInt(start, 10), 1), this.chromosomeSize);
    this.end        = Math.max(Math.min(typeof end   === 'number' ? Math.floor(end)   : parseInt(end,   10), this.chromosomeSize), 1);

    if (this.end < this.start) {
      this.end = Math.min(this.start + this.defaultLength - 1, this.chromosomeSize);
    }

    if (keepLength && this.end - this.start + 1 !== this.length) {
      if (this.end === this.chromosomeSize) {
        this.start = this.end - this.length + 1;
      } else {
        var center = (this.start + this.end) / 2;
        this.start = Math.max(Math.floor(center - this.length / 2), 1);
        this.end   = this.start + this.length - 1;

        if (this.end > this.chromosomeSize) {
          this.end   = this.chromosomeSize;
          this.start = this.end - this.length + 1;
        }
      }
    } else {
      this.length = this.end - this.start + 1;
    }
    this.setScale();
    if (update === true && (this.prev.start !== this.start || this.prev.end !== this.end)) {
      this.updateURL();
    }
    
  }

  setScale() {
    this.prev.scale  = this.scale;
    this.scale       = this.width / this.length;
    this.scaledStart = this.start * this.scale;
    
    if (this.prev.scale !== this.scale) {
      
      this.left        = 0;
      this.minLeft     = Math.round((this.end   - this.chromosomeSize) * this.scale);
      this.maxLeft     = Math.round((this.start - 1) * this.scale);
      this.labelBuffer = Math.ceil(this.textWidth / this.scale) * this.longestLabel;
      
      if (this.prev.scale) {
        this.cancelSelect();
        this.closeMenus();
      }
      
      this.onTracks('setScale');
      this.onTracks('makeFirstImage');
    }
    
  };

  checkTrackHeights() {
    if (this.dragging) {
      return;
    }

    this.onTracks('checkHeight');
  }

  resetTrackHeights() {
    this.onTracks('resetHeight');
  }

  zoomIn(x?: number) {
    if (!x) {
      x = this.width / 2;
    }

    var start = Math.round(this.start + x / (2 * this.scale));
    var end   = this.length === 2 ? start : Math.round(start + (this.length - 1) / 2);

    this.setRange(start, end, true);
  }

  zoomOut(x?: number) {
    if (!x) {
      x = this.width / 2;
    }

    var start = Math.round(this.start - x / this.scale);
    var end   = this.length === 1 ? start + 1 : Math.round(start + 2 * (this.length - 1));

    this.setRange(start, end, true);
  }

  addTrack(track: any, after?: any) {
    return this.addTracks([ track ], after)[0];
  }
 
  addTracks(tracks?: any[], after?: any) {
    const defaults = {
      browser : this,
      width   : this.width
    };

    const push       = Boolean(tracks);
    let order;

    tracks = tracks || $.extend([], this.tracks);

    if (push && !$.grep(this.tracks, function (t: any) { return typeof t === 'function'; }).length) {
      var insertAfter = (
        after ? $.grep(
          this.tracks,
          function (t: any) {
            return t.order < after;
          }) : this.tracks
        )
        .sort(function (a: any, b: any) { return b.order - a.order; })[0];

      if (insertAfter) {
        order = insertAfter.order + 0.1;
      }
    }

    for (var i = 0; i < tracks.length; i++) {
      order = typeof order === 'number' ? order : i;
      const config = this.savedConfig ? $.extend(true, {}, this.savedConfig[tracks[i].prototype.id]) : undefined;
      tracks[i].order = order;
      tracks[i].config = config;

      if (tracks[i].id) {
        this.tracksById[tracks[i].id] = tracks[i];
      }

      if (push) {
        this.tracks.push(tracks[i]);
      } else {
        this.tracks[i] = tracks[i];
      }
    }
    return tracks;
  }

  removeTrack(track: any) {
    this.removeTracks([ track ]);
  }

  removeTracks(tracks: any[]) {
    var i = tracks.length;
    var track, j;

    while (i--) {
      track = tracks[i];
      j     = this.tracks.length;

      while (j--) {
        if (track === this.tracks[j]) {
          this.tracks.splice(j, 1);
          break;
        }
      }

      if (track.id) {
        delete this.tracksById[track.id];
      }

      track.destructor(); // Destroy DOM elements and track itself
    }

    this.saveConfig();
  }

  sortTracks() {
    if ($.grep(
      this.tracks,
      function (t: any) {
        return typeof t !== 'object';
      }).length
    ) {
      return;
    }

    let sorted     = $.extend([], this.tracks).sort(function (a: any, b: any) { return a.order - b.order; });
    let labels: any[] = [];
    let containers: any[] = [];

    for (var i = 0; i < sorted.length; i++) {
      if (sorted[i].parentTrack) {
        continue;
      }

      sorted[i].order = i;

      if (sorted[i].menus.length) {
        sorted[i].top = sorted[i].container.position().top;
      }

      labels.push(sorted[i].label[0]);
      containers.push(sorted[i].container[0]);
    }

    this.labelContainer.append(labels);
    this.wrapper.append(containers);

    // Correct the order
    this.tracks = sorted;

    labels
      .map(
        function (li) {
          return $(li).data('track');
        })
      .forEach(
        function (track) {
          if (track.menus.length) {
            var diff = track.container.position().top - track.top;
            track.menus.css('top', function (i: any, top: any) {
              return parseInt(top, 10) + diff;
            });
            track.top = null;
          }
        }
      );

    sorted = labels = containers = null;
  }

  updateTrackOrder(e: any, ui: any) {
    const track = ui.item.data('track');

    if (track.unsortable) {
      return;
    }

    const prev = ui.item.prev().data('track');
    const next = ui.item.next().data('track');
    const p    = prev ? prev.order : 0;
    const n    = next ? next.order : 0;
    const o    = p || n;
    let order;

    if (prev && next && Math.floor(n) === Math.floor(p)) {
      order = p + (n - p) / 2;
    } else {
      order = o + (p ? 1 : -1) * Math.abs(Math.round(o) - o || 1) / 2;
    }

    track.order = order;

    this.sortTracks();
    this.saveConfig();
  }

  updateURL() {
    if (this.urlParamTemplate) {
      if (this.useHash) {
        window.location.hash = this.getQueryString();   
      } else {
        window.history.pushState({}, '', this.getQueryString());
      }
    }
  };

  popState(){
    const coords = this.getURLCoords();
    const start  = parseInt(coords.start, 10);
    const end    = parseInt(coords.end,   10);

    if (
      (coords.chr && coords.chr != this.chr) ||
      (coords.start && !(start === this.start && end === this.end))
    ) {
      // FIXME: a back action which changes scale or a zoom out will reset tracks, since scrollStart will not be the same as it was before
      this.moveTo(coords.chr, start, end);
    }

    this.closeMenus();
    this.hideMessages();
  }

  getURLCoords() { // USED
    let match  = ((this.useHash ? window.location.hash.replace(/^#/, '?') || window.location.search : window.location.search) + '&').match(this.paramRegex);
    const coords: any = {};
    let i = 0;

    if (!match) {
      return coords;
    }

    match = match.slice(2, -1);

    $.each(this.urlParamTemplate.split('__'), function () {
      var tmp = this.match(/^(CHR|START|END)$/);

      if (tmp) {
        coords[tmp[1].toLowerCase()] = tmp[1] === 'CHR' ? match[i++] : parseInt(match[i++], 10);
      }
    });

    return coords;
  }

  getQueryString () {
    var location = this.urlParamTemplate
      .replace('__CHR__',   this.chr)
      .replace('__START__', this.start.toString())
      .replace('__END__',   this.end.toString());

    return this.useHash ? location : window.location.search ? (window.location.search + '&').replace(this.paramRegex, '$1' + location + '$5').slice(0, -1) : '?' + location;
  }

  getChromosomeSize(chr: string) {
    return chr && this.genome && (<Chromosomes>this.genome)[chr] ? (<Chromosomes>this.genome)[chr].size : this.chromosomeSize;
  }

  die(error: string, el?: any) { // USED
    if (el && el.length) {
      el.html(error);
    } else {
      throw error;
    }

    this.failed = true;
  }

  makeMenu(features: any, event: any, track: any) {
    if (!features) {
      return false;
    }

    if (!$.isArray(features)) {
      features = [ features ];
    }

    if (features.length === 0) {
      return false;
    } else if (features.length === 1) {
      return this.makeFeatureMenu(features[0], event, track);
    }

    var browser = this;
    var menu    = this.menuTemplate.clone(true).data({ browser: this });
    var table   = $('.gv-menu-content', menu).addClass('gv-menu-content-first').find('table');

    $('.gv-focus, .gv-highlight, .gv-menu-loading', menu).remove();
    $('.gv-title', menu).html(features.length + ' features');

    $.each(features.sort(function (a, b) { return a.start - b.start; }), function (i: number, feature: any) {
      var location = feature.chr + ':' + feature.start + (feature.end === feature.start ? '' : '-' + feature.end);
      var title    = feature.menuLabel || feature.name || ($.isArray(feature.label) ? feature.label.join(' ') : feature.label) || (feature.id + '');

      $('<a href="#">').html(title.match(location) ? title : (location + ' ' + title)).on('click', function (e: any) {
        browser.makeFeatureMenu(feature, e, track);
        return false;
      }).appendTo($('<td>').appendTo($('<tr>').appendTo(table)));
    });

    menu.appendTo(this.superContainer || this.container).show();

    if (event) {
      menu.css({ left: 0, top: 0 }).position({ of: event, my: 'left top', collision: 'flipfit' });
    }

    this.menus = this.menus.add(menu);

    if (track) {
      track.menus = track.menus.add(menu);
    }

    return menu;
  }

  makeFeatureMenu(feature: any, e: any, track: any) {
    var browser   = this;
    var container = this.superContainer || this.container;
    let menu: any, table: any, content: any, loading: any, getMenu: any, isDeferred: boolean;
    let el: any, chr: string, start: number, end: number, linkData: any, key: string, columns: number, colspan: string;

    function focus() {
      var data    = $(this).data();
      var length  = data.end - data.start + 1;
      var context = Math.max(Math.round(length / 4), 25);

      browser.moveTo(data.chr, data.start - context, data.end + context, true);

      return false;
    }

    if (!feature.menuEl) {
      menu       = browser.menuTemplate.clone(true).data({ browser: browser, feature: feature });
      content    = $('.gv-menu-content', menu).remove();
      loading    = $('.gv-menu-loading', menu);
      
      getMenu    = track ? track.populateMenu(feature) : feature;
      isDeferred = typeof getMenu === 'object' && typeof getMenu.promise === 'function';

      if (isDeferred) {
        loading.show();
      }

      $.when(getMenu).done(function (properties: any) {
        if (!$.isArray(properties)) {
          properties = [ properties ];
        }

        for (let i = 0; i < properties.length; i++) {
          table   = '';
          el      = content.clone().addClass(i ? '' : 'gv-menu-content-first').appendTo(menu);
          chr     = typeof properties[i].chr !== 'undefined' ? properties[i].chr : feature.chr;
          start   = parseInt(typeof properties[i].start !== 'undefined' ? properties[i].start : feature.start, 10);
          end     = parseInt(typeof properties[i].end   !== 'undefined' ? properties[i].end   : feature.end,   10);
          columns = Math.max.apply(Math, $.map(properties[i], function (v: any) { return $.isArray(v) ? v.length : 1; }));

          if(properties[i].title){
            $('.gv-title', el).html(properties[i].title);
          } else {
            $('.gv-title', el).remove(properties[i].title);
          }

          if (track && start && end && !browser.isStatic) {
            linkData = { chr: chr, start: start, end: Math.max(end, start), label: feature.label || (properties[i].title || '').replace(/<[^>]+>/g, ''), color: feature.color };

            $('.gv-focus',     el).data(linkData).on('click', focus);
          } else {
            $('.gv-focus, .gv-highlight', el).remove();
          }

          for (key in properties[i]) {
            if (/^start|end$/.test(key) && properties[i][key] === false) {
              continue;
            }

            if (key !== 'title') {
              colspan = properties[i][key] === '' ? ' colspan="' + (columns + 1) + '"' : '';
              table  += '<tr><td' + colspan + '>' + key + '</td>';

              if (!colspan) {
                if ($.isArray(properties[i][key])) {
                  for (let j = 0; j < properties[i][key].length; j++) {
                    table += '<td>' + properties[i][key][j] + '</td>';
                  }
                } else if (columns === 1) {
                  table += '<td>' + properties[i][key] + '</td>';
                } else {
                  table += '<td colspan="' + columns + '">' + properties[i][key] + '</td>';
                }
              }

              table += '</tr>';
            }
          }

          if(table){
            $('table', el).html(table);
          } else {
            $('table', el).remove(table);
          }
        }

        if (isDeferred) {
          loading.hide();
        }
      });

      if (track) {
        menu.addClass(track.id).data('track', track);
      }

      feature.menuEl = menu.appendTo(container);
    } else {
      feature.menuEl.appendTo(container); // Move the menu to the end of the container again, so that it will always be on top of other menus
    }

    browser.menus = browser.menus.add(feature.menuEl);

    if (track) {
      track.menus =  track.menus.add(feature.menuEl);
    }

    feature.menuEl.show(); // Must show before positioning, else position will be wrong

    if (e) {
      feature.menuEl.css({ left: 0, top: 0 }).position({ of: e, my: 'left top', collision: 'flipfit' });
    }

    return feature.menuEl;
  }

  closeMenus(obj?: any) {
    obj = obj || this;

    obj.menus.filter(':visible').children('.gv-close').trigger('click');
    obj.menus = $();
  }

  hideMessages() { // USED
    if (this.autoHideMessages) {
      this.wrapper.find('.gv-message-container').addClass('gv-collapsed');
    }
  }

  getSelectorPosition() {
    const left  = this.selector.position().left;
    const width = this.selector.outerWidth(true);
    const start = Math.round(left / this.scale) + this.start;
    let end   = Math.round((left + width) / this.scale) + this.start - 1;
        end   = end <= start ? start : end;

    return { start: start, end: end, left: left, width: width };
  }

  on(events: any, obj?: any, fn?: any, once?: any) {
    const browser  = this;
    const eventMap = {};
    let f: string, fnString: any[], event: any;

    function makeEventMap(types: string, handler: any) {
      const typesAry = types.split(' ');

      for (let j = 0; j < typesAry.length; j++) {
        (<any>eventMap)[typesAry[j]] = ((<any>eventMap)[typesAry[j]] || []).concat(handler);
      }
    }

    function makeFnString(func: any) {
      return func.toString();
    }

    function compare(func: any) {
      f = func.toString();

      for (let j = 0; j < fnString.length; j++) {
        if (f === fnString[j]) {
          return true;
        }
      }
    }

    if (typeof events === 'object') {
      for (let i in events) {
        makeEventMap(i, events[i]);
      }
      obj = obj || this;
    } else {
      if (typeof fn === 'undefined') {
        fn  = obj;
        obj = this;
      }

      makeEventMap(events, fn);
    }

    const type = 'browser';
    //obj instanceof Track || obj === 'tracks' ? 'tracks' : 'browser';

    for (let i in eventMap) {
      event = i + (once ? '.once' : '');
      browser.events[type][event] = browser.events[type][event] || [];
      fnString = $.map((<any>eventMap)[i], makeFnString);
      
      if (!$.grep(browser.events[type][event], compare).length) {
        browser.events[type][event].push.apply(browser.events[type][event], (<any>eventMap)[i]);
      }
    }
  }

  once(events: any, obj: any, fn: any) {
    this.on(events, obj, fn, true);
  }

  destroy() {
    this.onTracks('destructor');
    (this.superContainer || this.container).empty();

    if (this.zoomInHighlight) {
      this.zoomInHighlight.add(this.zoomOutHighlight).remove();
    }

    $(window).add(<any>document).off(this.eventNamespace);

    for (var key in this) {
      delete this[key];
    }
  }
}