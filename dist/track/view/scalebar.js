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
var view_1 = require("./../view");
var ScalebarView = (function (_super) {
    __extends(ScalebarView, _super);
    function ScalebarView(genoverse, properties) {
        var _this = _super.call(this, genoverse, properties) || this;
        _this.colors = {
            majorGuideLine: '#CCCCCC',
            minorGuideLine: '#E5E5E5'
        };
        return _this;
    }
    ScalebarView.prototype.draw = function (features, featureContext, labelContext, scale) {
        var i = features.length;
        var minorUnit = this.minorUnit;
        var width = Math.ceil(minorUnit * scale);
        var feature, start, end;
        featureContext.textBaseline = 'top';
        featureContext.fillStyle = this.color;
        this.guideLines = { major: {} };
        while (i--) {
            feature = features[i];
            start = Math.round(feature.position[scale].X);
            end = start + width - 1;
            this.drawFeature($.extend({}, feature, {
                x: start,
                y: 0,
                width: Math.ceil(feature.position[scale].width),
                height: this.featureHeight
            }), featureContext, labelContext, scale);
            if (feature.label) {
                if (start > -1) {
                    featureContext.fillRect(start, this.featureHeight, 1, this.featureHeight);
                }
                this.guideLines.major[feature.start] = true;
            }
            if (feature.end < feature.start) {
                start--;
                end++;
            }
            this.guideLines[feature.start] = start;
            this.guideLines[feature.start + minorUnit] = end;
        }
        featureContext.fillRect(0, 0, featureContext.canvas.width, 1);
        featureContext.fillRect(0, this.featureHeight, featureContext.canvas.width, 1);
    };
    ScalebarView.prototype.drawBackground = function (f, context, params) {
        for (var i in this.guideLines) {
            if (this.guideLines[i] >= 0 && this.guideLines[i] <= this.width) {
                context.fillStyle = this.colors[this.guideLines.major[i] ? 'majorGuideLine' : 'minorGuideLine'];
                context.fillRect(this.guideLines[i], 0, 1, context.canvas.height);
            }
        }
    };
    ScalebarView.prototype.decorateFeature = function (feature, featureContext, scale) {
        throw new Error("Method not implemented.");
    };
    ScalebarView.prototype.formatLabel = function (label) {
        return this.minorUnit < 1000 ? label.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') : _super.prototype.formatLabel.call(this, label);
    };
    return ScalebarView;
}(view_1.default));
exports.default = ScalebarView;
