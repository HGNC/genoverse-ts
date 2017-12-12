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
var static_1 = require("./../static");
var legend_1 = require("./../../model/static/legend");
var legend_2 = require("./../../view/static/legend");
var $ = require("jquery");
var LegendTrack = (function (_super) {
    __extends(LegendTrack, _super);
    function LegendTrack(genoverse, properties) {
        var _this = _super.call(this, genoverse, properties) || this;
        _this.unsortable = true;
        _this.lockToTrack = true;
        _this.removable = false;
        _this.init();
        return _this;
    }
    LegendTrack.prototype.init = function () {
        this.model = this.createModel();
        this.setEvents();
        this.setDefaults();
        this.addDomElements();
        this.addUserEventHandlers();
        this.deferreds = [];
        this.container.addClass('gv-track-container-legend');
        this.browser.legends[this.id] = this;
        this.view = this.createView();
        this.setTracks();
    };
    LegendTrack.prototype.setEvents = function () {
        this.browser.on({
            'afterAddTracks afterRemoveTracks': function (tracks) {
                for (var i in this.legends) {
                    this.legends[i].setTracks();
                }
                this.sortTracks();
            },
            afterUpdateTrackOrder: function (e, ui) {
                var track = ui.item.data('track');
                var legendTrack = this.legends[track.id] || track.legendTrack;
                if (legendTrack && legendTrack.lockToTrack && legendTrack.unsortable === false) {
                    legendTrack.lockToTrack = false;
                }
                for (var i in this.legends) {
                    this.legends[i].updateOrder();
                }
                this.sortTracks();
            }
        });
        this.browser.on({
            afterPositionFeatures: function (features, params) {
                var legend = this.legendTrack;
                if (legend) {
                    setTimeout(function () { legend.controller.makeImage(params); }, 1);
                }
            },
            afterResize: function (height, userResize) {
                var legend = this.legendTrack;
                if (legend && userResize === true) {
                    legend.controller.makeImage({});
                }
            },
            afterCheckHeight: function () {
                var legend = this.legendTrack;
                if (legend) {
                    legend.controller.makeImage({});
                }
            },
            afterSetMVC: function () {
                var legend = this.legendTrack;
                if (legend && legend.tracks.length) {
                    legend.disable();
                    if (this.legend !== false) {
                        legend.enable();
                    }
                }
            }
        }, this);
    };
    LegendTrack.prototype.setTracks = function () {
        var legend = this;
        var type = this.type;
        this.tracks = $.grep(this.browser.tracks, function (t) {
            if (t.legendType === type && !t.disabled) {
                t.legendTrack = t.legendTrack || legend;
                return true;
            }
        });
        this.tracks = this.tracks.concat($.map(this.tracks, function (t) {
            var linkedTrack = t.subtrack || t.parentTrack;
            return linkedTrack && linkedTrack.disabled !== true ? linkedTrack : null;
        }));
        this.updateOrder();
        this[this.tracks.length ? 'enable' : 'disable']();
    };
    LegendTrack.prototype.updateOrder = function () {
        var tracks = this.tracks.filter(function (t) { return !t.parentTrack; });
        if (tracks.length && this.lockToTrack) {
            this.order = tracks[tracks.length - 1].order + 0.1;
        }
    };
    LegendTrack.prototype.enable = function () {
        _super.prototype.enable.call(this);
        this.makeImage({});
    };
    LegendTrack.prototype.disable = function () {
        delete this.stringified;
        _super.prototype.disable.call(this);
    };
    LegendTrack.prototype.createModel = function () {
        return new legend_1.default(this.browser, { width: this.width, type: this.type });
    };
    LegendTrack.prototype.createView = function (properties) {
        return new legend_2.default(this.browser, {
            featureHeight: 20,
            width: this.width,
            margin: this.margin,
        });
    };
    LegendTrack.prototype.destroy = function () {
        delete this.browser.legends[this.id];
        _super.prototype.destroy.call(this);
    };
    LegendTrack.prototype.setDefaults = function () {
        this.order = typeof this.order !== 'undefined' ? this.order : 9e99;
        this.id = this.id || 'legend';
        this.type = this.type || 'legend';
        _super.prototype.setDefaults.call(this);
    };
    return LegendTrack;
}(static_1.default));
exports.default = LegendTrack;
