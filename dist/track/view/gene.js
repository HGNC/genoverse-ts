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
var $ = require("jquery");
var GeneView = (function (_super) {
    __extends(GeneView, _super);
    function GeneView(genoverse, properties) {
        return _super.call(this, genoverse, properties) || this;
    }
    GeneView.prototype.drawBackground = function (feature, canvasContext, imgData) {
        $.noop;
    };
    GeneView.prototype.decorateFeature = function (feature, featureContext, scale) {
        $.noop;
    };
    return GeneView;
}(view_1.default));
exports.default = GeneView;
