"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
var rtree_1 = require("rtree");
var TrackModel = (function () {
    function TrackModel(genoverse, properties) {
        this.dataType = 'json';
        this.allData = false;
        this.dataBuffer = undefined;
        this.xhrFields = undefined;
        this.url = undefined;
        this.urlParams = undefined;
        this.data = undefined;
        this.dataRequestLimit = undefined;
        if (properties)
            $.extend(this, properties);
        this.browser = genoverse;
        this.init();
    }
    TrackModel.prototype.init = function (reset) {
        this.setDefaults(reset);
        if (reset) {
            for (var i in this.featuresById) {
                delete this.featuresById[i].position;
            }
        }
        if (!reset || this.data) {
            delete this.dataRangesByChr;
            delete this.featuresByChr;
            this.featuresById = {};
            this.setChrProps();
        }
        this.dataLoading = [];
    };
    TrackModel.prototype.setDefaults = function (reset) {
        this.dataBuffer = this.dataBuffer || { start: 0, end: 0 };
        this.urlParams = this.urlParams || {};
        this.xhrFields = this.xhrFields || {};
        this.dataBufferStart = this.dataBuffer.start;
        if (!this._url) {
            this._url = this.url;
        }
        if (reset && !this.url && this._url) {
            this.url = this._url;
        }
    };
    TrackModel.prototype.setChrProps = function () {
        var chr = this.browser.chr;
        this.dataRangesByChr = this.dataRangesByChr || {};
        this.featuresByChr = this.featuresByChr || {};
        this.dataRangesByChr[chr] = this.dataRangesByChr[chr] || new rtree_1.default();
        this.featuresByChr[chr] = this.featuresByChr[chr] || new rtree_1.default();
    };
    TrackModel.prototype.features = function (chr) { return this.featuresByChr[chr]; };
    TrackModel.prototype.dataRanges = function (chr) { return this.dataRangesByChr[chr]; };
    TrackModel.prototype.parseURL = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var chr = args[0];
        var start = args[1];
        var end = args[2];
        var url = args[3];
        if (this.allData) {
            start = 1;
            end = this.browser.getChromosomeSize(chr);
        }
        return (url || this.url).replace(/__ASSEMBLY__/, this.browser.assembly).replace(/__CHR__/, args[0]).replace(/__START__/, start).replace(/__END__/, end);
    };
    TrackModel.prototype.setLabelBuffer = function (buffer) {
        this.dataBuffer.start = Math.max(this.dataBufferStart, buffer);
    };
    TrackModel.prototype.getData = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var chr = args[0];
        var start = args[1];
        var end = args[2];
        var done = args[3];
        start = Math.max(1, start);
        end = Math.min(this.browser.getChromosomeSize(chr), end);
        var deferred = $.Deferred();
        if (typeof this.data !== 'undefined') {
            this.receiveData(typeof this.data.sort === 'function' ? this.data.sort(function (a, b) { return a.start - b.start; }) : this.data, chr, start, end);
            return deferred.resolveWith(this);
        }
        var model = this;
        var bins = [];
        var length = end - start + 1;
        if (!this.url) {
            return deferred.resolveWith(this);
        }
        if (this.dataRequestLimit && length > this.dataRequestLimit) {
            var i = Math.ceil(length / this.dataRequestLimit);
            while (i--) {
                bins.push([start, i ? start += this.dataRequestLimit - 1 : end]);
                start++;
            }
        }
        else {
            bins.push([start, end]);
        }
        $.when.apply($, $.map(bins, function (bin) {
            var request = $.ajax({
                url: model.parseURL(chr, bin[0], bin[1]),
                data: model.urlParams,
                dataType: model.dataType,
                context: model,
                xhrFields: model.xhrFields,
                success: function (data) { this.receiveData(data, chr, bin[0], bin[1]); },
                error: function (xhr, statusText) { this.track.controller.showError(statusText + ' while getting the data, see console for more details', arguments); },
                complete: function (xhr) { this.dataLoading = $.grep(this.dataLoading, function (t) { return xhr !== t; }); }
            });
            request.coords = [chr, bin[0], bin[1]];
            if (typeof done === 'function') {
                request.done(done);
            }
            model.dataLoading.push(request);
            return request;
        })).done(function () { deferred.resolveWith(model); });
        return deferred;
    };
    TrackModel.prototype.receiveData = function (data, chr, start, end) {
        start = Math.max(start, 1);
        end = Math.min(end, this.browser.getChromosomeSize(chr));
        this.setDataRange(chr, start, end);
        this.parseData(data, chr, start, end);
        if (this.allData) {
            this.url = false;
        }
    };
    TrackModel.prototype.parseData = function (data, chr, start, end) {
        var feature;
        for (var i = 0; i < data.length; i++) {
            feature = data[i];
            feature.chr = feature.chr || chr;
            feature.sort = start + i;
            this.insertFeature(feature);
        }
    };
    TrackModel.prototype.setDataRange = function (chr, start, end) {
        if (this.allData) {
            start = 1;
            end = this.browser.getChromosomeSize(chr);
        }
        this.dataRanges(chr).insert({ x: start, w: end - start + 1, y: 0, h: 1 }, [start, end]);
    };
    TrackModel.prototype.checkDataRange = function (chr, start, end) {
        start = Math.max(1, start);
        end = Math.min(this.browser.getChromosomeSize(chr), end);
        var ranges = this.dataRanges(chr).search({ x: start, w: end - start + 1, y: 0, h: 1 }).sort(function (a, b) { return a[0] - b[0]; });
        if (!ranges.length) {
            return false;
        }
        var s = ranges.length === 1 ? ranges[0][0] : 9e99;
        var e = ranges.length === 1 ? ranges[0][1] : -9e99;
        for (var i = 0; i < ranges.length - 1; i++) {
            if (ranges[i][0] <= ranges[i + 1][0] && ((ranges[i][1] >= ranges[i + 1][1]) || (ranges[i][1] + 1 >= ranges[i + 1][0]))) {
                s = Math.min(s, ranges[i][0]);
                e = Math.max(e, ranges[i][1], ranges[i + 1][1]);
            }
            else {
                return false;
            }
        }
        return start >= s && end <= e;
    };
    TrackModel.prototype.insertFeature = function (feature) {
        if (!feature.chr) {
            return;
        }
        if (!feature.id) {
            feature.id = feature.ID || this.hashCode(JSON.stringify($.extend({}, feature, { sort: '' })));
        }
        var features = this.features(feature.chr);
        if (features && !this.featuresById[feature.id]) {
            features.insert({ x: feature.start, y: 0, w: feature.end - feature.start + 1, h: 1 }, feature);
            this.featuresById[feature.id] = feature;
        }
    };
    TrackModel.prototype.findFeatures = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var features = this.features(args[0]).search({ x: args[1] - this.dataBuffer.start, y: 0, w: args[2] - args[1] + this.dataBuffer.start + this.dataBuffer.end + 1, h: 1 });
        var filters = this.featureFilters || [];
        for (var i = 0; i < filters.length; i++) {
            features = $.grep(features, $.proxy(filters[i], this));
        }
        return this.sortFeatures(features);
    };
    TrackModel.prototype.sortFeatures = function (features) {
        return features.sort(function (a, b) { return a.sort - b.sort; });
    };
    TrackModel.prototype.abort = function () {
        for (var i = 0; i < this.dataLoading.length; i++) {
            this.dataLoading[i].abort();
        }
        this.dataLoading = [];
    };
    TrackModel.prototype.hashCode = function (string) {
        var hash = 0;
        if (!string.length) {
            return hash;
        }
        for (var i = 0; i < string.length; i++) {
            var c = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + c;
            hash = hash & hash;
        }
        return '' + hash;
    };
    TrackModel.prototype.reset = function () {
        delete this.dataRangesByChr;
        delete this.featuresByChr;
        this.featuresById = {};
        this.setChrProps();
    };
    return TrackModel;
}());
exports.default = TrackModel;
