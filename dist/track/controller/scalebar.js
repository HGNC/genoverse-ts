"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var controller_1 = require("./../controller");
var scalebar_1 = require("./../view/scalebar");
var scalebar_2 = require("./../model/scalebar");
var rtree_1 = require("rtree");
var $ = require("jquery");
var ScalebarTrack = (function (_super) {
    __extends(ScalebarTrack, _super);
    function ScalebarTrack(genoverse, properties) {
        var _this = _super.call(this, genoverse, properties) || this;
        _this.height = 20;
        _this.featureHeight = 3;
        _this.margin = 0;
        _this.unsortable = true;
        _this.order = 0;
        _this.orderReverse = 1e5;
        _this.featureStrand = 1;
        _this.controls = 'off';
        _this.featureMargin = { top: 0, right: 0, bottom: 2, left: 0 };
        _this.minPixPerMajor = 100;
        _this.color = '#000000';
        _this.autoHeight = false;
        _this.labels = true;
        _this.bump = false;
        _this.resizable = false;
        _this.click = $.noop;
        _this.init();
        return _this;
    }
    ScalebarTrack.prototype.init = function () {
        this.model = this.createModel();
        this.setEvents();
        this.setDefaults();
        this.addDomElements();
        this.addUserEventHandlers();
        this.deferreds = [];
        this.view = this.createView();
    };
    ScalebarTrack.prototype.createView = function () {
        var prop = {
            minorUnit: this.minorUnit,
            margin: this.margin,
            height: this.height,
            featureHeight: this.featureHeight,
            width: this.width
        };
        return new scalebar_1.default(this.browser, prop);
    };
    ScalebarTrack.prototype.createModel = function () {
        return new scalebar_2.default(this.browser);
    };
    ScalebarTrack.prototype.setEvents = function () {
        var browser = this.browser;
        function resize() {
            $('.gv-bg.gv-full-height', browser.container).height(function () {
                return browser.wrapper.outerHeight(true) - $(this).parents('.gv-track-container').position().top;
            });
        }
        browser.on('afterAddTracks', resize);
        browser.on('afterResize', this, resize);
    };
    ScalebarTrack.prototype.setScale = function () {
        var features = {};
        this.setMajorMinorUnits();
        features[this.browser.chr] = new rtree_1.default();
        this.featuresByChr = features;
        this.featuresById = {};
        this.seen = {};
        _super.prototype.setScale.call(this);
    };
    ScalebarTrack.prototype.setMajorMinorUnits = function () {
        var max = this.browser.width / this.minPixPerMajor;
        var divisor = 5;
        var majorUnit = -1;
        var fromDigit = ('' + this.browser.start).split('');
        var toDigit = ('' + this.browser.end).split('');
        var divisions, i;
        for (i = 0; i < fromDigit.length; i++) {
            divisions = parseInt(toDigit.slice(0, fromDigit.length - i).join(''), 10) - parseInt(fromDigit.slice(0, fromDigit.length - i).join(''), 10);
            if (divisions && divisions <= max) {
                majorUnit = parseInt('1' + $.map(new Array(i), function () { return '0'; }).join(''), 10);
                break;
            }
        }
        if (majorUnit === -1) {
            majorUnit = this.browser.length === 1 ? 1 : parseInt('1' + $.map(new Array(fromDigit.length), function () { return '0'; }).join(''), 10);
            divisor = 1;
        }
        else {
            if (divisions * 5 <= max) {
                majorUnit /= 5;
                divisor = 2;
            }
            else if (divisions * 4 <= max) {
                majorUnit /= 4;
                divisor = 1;
            }
            else if (divisions * 2 <= max) {
                majorUnit /= 2;
            }
        }
        majorUnit = Math.max(majorUnit, 1);
        this.majorUnit = majorUnit;
        this.minorUnit = Math.max(majorUnit / divisor, 1);
    };
    ScalebarTrack.prototype.setDefaults = function () {
        _super.prototype.setDefaults.call(this);
        this.width = this.browser.width;
        this.setMajorMinorUnits();
    };
    ScalebarTrack.prototype.setFeatures = function (chr, start, end) {
        var minorUnit = this.minorUnit;
        var majorUnit = this.majorUnit;
        var seen = this.seen;
        start = Math.max(start - (start % minorUnit) - majorUnit, 0);
        var flip = (start / minorUnit) % 2 ? 1 : -1;
        var feature, major, label;
        this.model.reset();
        for (var x = start; x < end + minorUnit; x += minorUnit) {
            flip *= -1;
            if (seen[x]) {
                continue;
            }
            seen[x] = 1;
            feature = { id: chr + ':' + x, chr: chr, strand: 1, sort: x };
            major = x && x % majorUnit === 0;
            if (flip === 1) {
                feature.start = x;
                feature.end = x + minorUnit - 1;
            }
            if (major) {
                label = this.view.formatLabel(x);
                if (label !== this.lastLabel) {
                    feature.label = label;
                    if (!feature.end) {
                        feature.start = x;
                        feature.end = x - 1;
                    }
                }
                this.lastLabel = label;
            }
            if (feature.end) {
                this.model.insertFeature(feature);
            }
        }
    };
    ;
    ScalebarTrack.prototype.makeFirstImage = function (moveTo) {
        if (this.strand === -1) {
            moveTo = this.forwardTrack.scrollStart;
        }
        return _super.prototype.makeFirstImage.call(this, moveTo);
    };
    ;
    ScalebarTrack.prototype.makeImage = function (params) {
        params.background = 'gv-guidelines gv-full-height';
        params.height = this.height;
        params.featureHeight = this.height;
        this.setFeatures(params.chr, params.start, params.end);
        var rtn = _super.prototype.makeImage.call(this, params);
        params.container.addClass('gv-full-height');
        return rtn;
    };
    ScalebarTrack.prototype.makeReverseImage = function (params) {
        this.imgContainers.push(params.container.clone().html(params.container.children('.gv-data').clone(true).css({ opacity: 1, background: this.browser.wrapper.css('backgroundColor') }))[0]);
        this.scrollContainer.append(this.imgContainers);
    };
    ScalebarTrack.prototype.renderBackground = function (f, bgImage, params) {
        bgImage.height(this.browser.wrapper.outerHeight(true));
        _super.prototype.renderBackground.call(this, f, bgImage, params);
    };
    return ScalebarTrack;
}(controller_1.default));
exports.default = ScalebarTrack;
