import * as $ from 'jquery';
import Genoverse from '../genoverse';
import RTree from 'rtree';

export default class TrackModel {
  browser: Genoverse;
  _url: any;
  dataBufferStart: any;
  featureFilters: any[];
  width: number;
  dataLoading: any[];
  featuresByChr: any;
  dataRangesByChr: any;
  featuresById: any;
  dataType: string = 'json';
  allData: boolean      = false;
  dataBuffer: any       = undefined; // e.g. { start: 0, end: 0 } - basepairs to extend data region for, when getting data from the origin
  xhrFields: any        = undefined;
  url: any              = undefined;
  urlParams: any        = undefined; // hash of URL params
  data: any             = undefined; // if defined, will be used instead of fetching data from a source
  dataRequestLimit: number = undefined; // if defined, multiple requests will be made by getData if the region size exceeds its value
  
  constructor(genoverse: Genoverse, properties?: any) {
    if(properties) $.extend(this, properties);
    this.browser = genoverse;
    this.init();
  }

  init(reset?: any) {
    this.setDefaults(reset);

    if (reset) {
      for (const i in this.featuresById) {
        delete this.featuresById[i].position;
      }
    }

    if (!reset || this.data) {
      delete this.dataRangesByChr;
      delete this.featuresByChr;
      this.featuresById = {};
      this.setChrProps();
    }

    this.dataLoading = []; // tracks incomplete requests for data
  }

  setDefaults(reset?: any) {
    this.dataBuffer = this.dataBuffer || { start: 0, end: 0 }; // basepairs to extend data region for, when getting data from the origin
    this.urlParams  = this.urlParams  || {};                   // hash of URL params
    this.xhrFields  = this.xhrFields  || {};

    this.dataBufferStart = this.dataBuffer.start; // Remember original dataBuffer.start, since dataBuffer.start is updated based on browser scale, in setLabelBuffer

    if (!this._url) {
      this._url = this.url; // Remember original url
    }

    if (reset && !this.url && this._url) {
      this.url = this._url;
    }
  }

  setChrProps() {
    var chr = this.browser.chr;

    this.dataRangesByChr = this.dataRangesByChr || {};
    this.featuresByChr   = this.featuresByChr   || {};

    this.dataRangesByChr[chr] = this.dataRangesByChr[chr] || new RTree();
    this.featuresByChr[chr]   = this.featuresByChr[chr]   || new RTree();
  }

  features (chr: string) { return this.featuresByChr[chr]; }
  
  dataRanges(chr: string) { return this.dataRangesByChr[chr]; }

  parseURL(...args: any[]) {
    let chr: string = args[0];
    let start: number = args[1];
    let end: number = args[2];
    let url: string = args[3];

    if (this.allData) {
      start = 1;
      end   = this.browser.getChromosomeSize(chr);
    }

    return (url || this.url).replace(/__ASSEMBLY__/, this.browser.assembly).replace(/__CHR__/, args[0]).replace(/__START__/, start).replace(/__END__/, end);
  }

  setLabelBuffer(buffer: any) {
    this.dataBuffer.start = Math.max(this.dataBufferStart, buffer);
  }

  getData(...args: any[]) {
    const chr: string = args[0];
    let start: number = args[1];
    let end: number = args[2];
    const done: any = args[3];

    start = Math.max(1, start);
    end   = Math.min(this.browser.getChromosomeSize(chr), end);

    
    const deferred = $.Deferred();

    if (typeof this.data !== 'undefined') {
      this.receiveData(typeof this.data.sort === 'function' ? this.data.sort(function (a: any, b: any) { return a.start - b.start; }) : this.data, chr, start, end);
      return deferred.resolveWith(this);
    }

    const model  = this;
    const bins   = [];
    const length = end - start + 1;

    if (!this.url) {
      return deferred.resolveWith(this);
    }

    if (this.dataRequestLimit && length > this.dataRequestLimit) {
      let i = Math.ceil(length / this.dataRequestLimit);

      while (i--) {
        bins.push([ start, i ? start += this.dataRequestLimit - 1 : end ]);
        start++;
      }
    } else {
      bins.push([ start, end ]);
    }

    $.when.apply($, $.map(bins, function (bin) {
      const request: any = $.ajax({
        url       : model.parseURL(chr, bin[0], bin[1]),
        data      : model.urlParams,
        dataType  : model.dataType,
        context   : model,
        xhrFields : model.xhrFields,
        success   : function (data) { this.receiveData(data, chr, bin[0], bin[1]); },
        error     : function (xhr, statusText) { this.track.controller.showError(statusText + ' while getting the data, see console for more details', arguments); },
        complete  : function (xhr) { this.dataLoading = $.grep(this.dataLoading, function (t) { return xhr !== t; }); }
      });

      request.coords = [ chr, bin[0], bin[1] ]; // store actual chr, start and end on the request, in case they are needed

      if (typeof done === 'function') {
        request.done(done);
      }

      model.dataLoading.push(request);

      return request;
    })).done(function () { deferred.resolveWith(model); });

    return deferred;
  }

  receiveData(data: any, chr: string, start: number, end: number) {
    start = Math.max(start, 1);
    end   = Math.min(end, this.browser.getChromosomeSize(chr));

    this.setDataRange(chr, start, end);
    this.parseData(data, chr, start, end);

    if (this.allData) {
      this.url = false;
    }
  }

  /**
  * parseData(data, chr, start, end) - parse raw data from the data source (e.g. online web service)
  * extract features and insert it into the internal features storage (RTree)
  *
  * >> data  - raw data from the data source (e.g. ajax response)
  * >> chr   - chromosome of the data
  * >> start - start location of the data
  * >> end   - end   location of the data
  * << nothing
  *
  * every feature extracted this routine must construct a hash with at least 3 values:
  *  {
  *    id    : [unique feature id, string],
  *    start : [chromosomal start position, integer],
  *    end   : [chromosomal end position, integer],
  *    [other optional key/value pairs]
  *  }
  *
  * and call this.insertFeature(feature)
  */
  parseData(data: any, chr: string, start: number, end: number): void {
    let feature;
    // Example of parseData function when data is an array of hashes like { start: ..., end: ... }
    for (var i = 0; i < data.length; i++) {
      feature = data[i];

      feature.chr  = feature.chr || chr;
      feature.sort = start + i;

      this.insertFeature(feature);
    }
  }
/*
  updateData(data: any) {
    this.data = data;
    this.track.reset();
  }
*/
  setDataRange(chr: string, start: number, end: number) {
    if (this.allData) {
      start = 1;
      end   = this.browser.getChromosomeSize(chr);
    }

    this.dataRanges(chr).insert({ x: start, w: end - start + 1, y: 0, h: 1 }, [ start, end ]);
  }

  checkDataRange(chr: string, start: number, end: number) {
    start = Math.max(1, start);
    end   = Math.min(this.browser.getChromosomeSize(chr), end);

    const ranges = this.dataRanges(chr).search({ x: start, w: end - start + 1, y: 0, h: 1 }).sort(function (a: any, b: any) { return a[0] - b[0]; });

    if (!ranges.length) {
      return false;
    }

    let s = ranges.length === 1 ? ranges[0][0] : 9e99;
    let e = ranges.length === 1 ? ranges[0][1] : -9e99;

    for (var i = 0; i < ranges.length - 1; i++) {
      // s0 <= s1 && ((e0 >= e1) || (e0 + 1 >= s1))
      if (ranges[i][0] <= ranges[i + 1][0] && ((ranges[i][1] >= ranges[i + 1][1]) || (ranges[i][1] + 1 >= ranges[i + 1][0]))) {
        s = Math.min(s, ranges[i][0]);
        e = Math.max(e, ranges[i][1], ranges[i + 1][1]);
      } else {
        return false;
      }
    }

    return start >= s && end <= e;
  }

  insertFeature(feature: any) {
    if (!feature.chr) {
      return;
    }

    // Make sure we have a unique ID, this method is not efficient, so better supply your own id
    if (!feature.id) {
      feature.id = feature.ID || this.hashCode(JSON.stringify($.extend({}, feature, { sort: '' }))); // sort is dependant on the browser's region, so will change on zoom
    }
    const features = this.features(feature.chr);
    if (features && !this.featuresById[feature.id]) {
      features.insert({ x: feature.start, y: 0, w: feature.end - feature.start + 1, h: 1 }, feature);
      this.featuresById[feature.id] = feature;
    }
  }

  findFeatures(...args: any[]) {
    
    var features = this.features(args[0]).search({ x: args[1] - this.dataBuffer.start, y: 0, w: args[2] - args[1] + this.dataBuffer.start + this.dataBuffer.end + 1, h: 1 });
    var filters  = this.featureFilters || [];

    for (var i = 0; i < filters.length; i++) {
      features = $.grep(features, $.proxy(filters[i], this));
    }

    return this.sortFeatures(features);
  }

  sortFeatures(features: any) {
    return features.sort(function (a: any, b: any) { return a.sort - b.sort; });
  }

  abort() {
    for (let i = 0; i < this.dataLoading.length; i++) {
      this.dataLoading[i].abort();
    }

    this.dataLoading = [];
  }

  hashCode(string: string) {
    let hash = 0;

    if (!string.length) {
      return hash;
    }

    for (let i = 0; i < string.length; i++) {
      const c = string.charCodeAt(i);
      hash = ((hash << 5) - hash) + c;
      hash = hash & hash; // Convert to 32bit integer
    }

    return '' + hash;
  }

  reset(): void{
    delete this.dataRangesByChr;
    delete this.featuresByChr;
    this.featuresById = {};
    this.setChrProps();
  }
}