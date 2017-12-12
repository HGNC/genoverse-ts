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
var chromosome_1 = require("./../model/chromosome");
var chromosome_2 = require("./../view/chromosome");
var $ = require("jquery");
require("./../../lib/jquery-tipsy");
var ChromosomeTrack = (function (_super) {
    __extends(ChromosomeTrack, _super);
    function ChromosomeTrack(genoverse, properties) {
        var _this = _super.call(this, genoverse, properties) || this;
        _this.margin = 1;
        _this.height = 20;
        _this.featureHeight = 20;
        _this.model = _this.createModel();
        _this.setDefaults();
        _this.id = 'chromosome';
        _this.labels = 'overlay';
        _this.url = false;
        _this.allData = true;
        _this.border = false;
        _this.legend = false;
        _this.unsortable = true;
        _this.name = 'Chr ' + genoverse.chr;
        _this.width = genoverse.width;
        _this.featureMargin = { top: 0, right: 0, bottom: 0, left: 0 };
        _this.setEvents();
        _this.init();
        return _this;
    }
    ChromosomeTrack.prototype.init = function () {
        this.setDefaults();
        this.addDomElements();
        this.addUserEventHandlers();
        this.deferreds = [];
        if (this.browser.scale) {
            this.setScale();
            this.makeFirstImage();
        }
        this.view = this.createView();
    };
    ChromosomeTrack.prototype.trackFactory = function (genoverse, properties) {
        return new ChromosomeTrack(genoverse, properties);
    };
    ChromosomeTrack.prototype.setEvents = function () {
    };
    ChromosomeTrack.prototype.createModel = function () {
        return new chromosome_1.default(this.browser);
    };
    ChromosomeTrack.prototype.createView = function () {
        var prop = {
            featureHeight: this.defaultHeight,
            margin: this.margin,
            resizable: this.resizable,
            height: this.height,
            minLabelHeight: this.minLabelHeight,
            featureMargin: this.featureMargin,
            labels: this.labels
        };
        return new chromosome_2.default(this.browser, prop);
    };
    ChromosomeTrack.prototype.click = function (e) {
        var offset = this.container.parent().offset().left;
        var x = e.pageX - offset;
        var f = this.view.scaleSettings[this.browser.chr][this.scale].featurePositions.search({ x: x, y: 1, w: 1, h: 1 })[0];
        if (f) {
            if (e.type === 'mouseup') {
                if (!this.browser.parent.isStatic) {
                    this.browser.parent.moveTo(f.chr, f.start, f.end, true);
                }
            }
            else if (this.hoverFeature !== f && !this.browser.hideTooltip) {
                this.container.tipsy('hide');
                if (f.label) {
                    var left = offset + f.position[this.scale].start + f.position[this.scale].width / 2;
                    this.container.attr('title', f.label[0]).tipsy({ trigger: 'manual', container: 'body' }).tipsy('show').data('tipsy').$tip.css('left', function () { return left - $(this).width() / 2; });
                }
                this.hoverFeature = f;
            }
        }
    };
    ChromosomeTrack.prototype.addUserEventHandlers = function () {
        var track = this;
        _super.prototype.addUserEventHandlers.call(this);
        track.container.on({
            mousemove: function (e) { track.click(e); },
            mouseout: function (e) {
                if (track.browser.viewPoint.is($(e.relatedTarget)) || track.browser.viewPoint.find($(e.relatedTarget)).length) {
                    return true;
                }
                track.container.tipsy('hide');
                track.hoverFeature = false;
            }
        }, '.gv-image-container');
        this.browser.on('mousewheel', '.gv-image-container, .gv-selector', function (e) {
            e.stopPropagation();
        });
    };
    ChromosomeTrack.prototype.afterSetName = function () {
        this.label.css('lineHeight', this.label.height() + 'px');
    };
    ChromosomeTrack.prototype.populateMenu = function (feature) {
        return {
            title: feature.menuTitle,
            Position: feature.chr + ':' + feature.start + '-' + feature.end
        };
    };
    return ChromosomeTrack;
}(controller_1.default));
exports.default = ChromosomeTrack;
