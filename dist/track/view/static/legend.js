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
var LegendView = (function (_super) {
    __extends(LegendView, _super);
    function LegendView(genoverse, properties) {
        var _this = _super.call(this, genoverse, properties) || this;
        _this.textColor = '#000000';
        _this.labels = 'overlay';
        _this.featureHeight = 12;
        return _this;
    }
    LegendView.prototype.decorateFeature = function (feature, featureContext, scale) {
        throw new Error("Method not implemented.");
    };
    LegendView.prototype.drawBackground = function (feature, canvasContext, imgData) {
        throw new Error("Method not implemented.");
    };
    LegendView.prototype.positionFeatures = function (f, params) {
        if (params.positioned) {
            return f;
        }
        var cols = 2;
        var pad = 5;
        var w = 20;
        var x = 0;
        var y = 0;
        var xScale = this.width / cols;
        var yScale = this.fontHeight + pad;
        var features = [];
        var xPos, yPos, labelWidth;
        for (var i = 0; i < f.length; i++) {
            xPos = (x * xScale) + pad;
            yPos = (y * yScale) + pad;
            labelWidth = this.context.measureText(f[i][0]).width;
            features.push({ x: xPos, y: yPos, width: w, height: this.featureHeight, color: f[i][1] }, { x: xPos + pad + w, y: yPos, width: labelWidth + 1, height: 0, color: false, labelColor: this.textColor, labelWidth: labelWidth, label: f[i][0] });
            if (++x === cols) {
                x = 0;
                y++;
            }
        }
        this.height = f.length ? ((y + (x ? 1 : 0)) * yScale) + pad : 0;
        params.height = this.height;
        params.width = this.width;
        params.positioned = true;
        return _super.prototype.positionFeatures.call(this, features, params);
    };
    return LegendView;
}(static_1.default));
exports.default = LegendView;
