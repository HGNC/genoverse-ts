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
var static_1 = require("../static");
var LegendModel = (function (_super) {
    __extends(LegendModel, _super);
    function LegendModel(genoverse, properties) {
        var _this = _super.call(this, genoverse) || this;
        $.extend(_this, properties);
        return _this;
    }
    LegendModel.prototype.findFeatures = function () {
        var bounds = { x: this.browser.scaledStart, y: 0, w: this.width, h: 0 };
        var features = {};
        for (var index = 0; index < this.browser.tracks.length; index++) {
            var track = this.browser.tracks[index];
            if (track.legendType === this.type) {
                var featurePositions = track.featurePositions;
                bounds.h = track.height;
                if (featurePositions) {
                    var feats = featurePositions.search(bounds).concat(track.labelPositions.search(bounds));
                    for (var j = 0; j < feats.length; j++) {
                        var feat = feats[j];
                        if (feat.legend) {
                            features[feat.legend] = feat.legendColor || feat.color;
                        }
                    }
                }
            }
        }
        return this.sortFeatures($.map(features, function (color, text) { return [[text, color]]; }));
    };
    LegendModel.prototype.sortFeatures = function (features) {
        return features.sort(function (a, b) {
            var x = a[0].toLowerCase();
            var y = b[0].toLowerCase();
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    };
    return LegendModel;
}(static_1.default));
exports.default = LegendModel;
