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
var view_1 = require("../view");
var $ = require("jquery");
var StaticView = (function (_super) {
    __extends(StaticView, _super);
    function StaticView(genoverse, properties) {
        var _this = _super.call(this, genoverse, properties) || this;
        _this.featureMargin = { top: 0, right: 1, bottom: 0, left: 1 };
        return _this;
    }
    StaticView.prototype.positionFeature = function () {
        $.noop;
    };
    StaticView.prototype.scaleFeatures = function (features) { return features; };
    StaticView.prototype.draw = function (features, featureContext, labelContext, scale) {
        for (var i = 0; i < features.length; i++) {
            this.drawFeature(features[i], featureContext, labelContext, scale);
        }
    };
    return StaticView;
}(view_1.default));
exports.default = StaticView;
