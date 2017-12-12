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
var $ = require("jquery");
var GeneTrack = (function (_super) {
    __extends(GeneTrack, _super);
    function GeneTrack(genoverse, properties) {
        var _this = _super.call(this, genoverse, properties) || this;
        _this.width = _this.browser.width;
        _this.lengthDependentMV = _this.lengthDependentMV.sort(function (a, b) { return b.minLength - a.minLength; });
        _this.init();
        return _this;
    }
    GeneTrack.prototype.setEvents = function () {
        $.noop;
    };
    GeneTrack.prototype._getSettingsForLength = function () {
        var length = this.browser.length || (this.browser.end - this.browser.start + 1);
        for (var i = 0; i < this.lengthDependentMV.length; i++) {
            if (length > this.lengthDependentMV[i].minLength || length === 1 && this.lengthDependentMV[i].minLength === 1) {
                return this.lengthDependentMV[i];
            }
        }
        throw new Error('A default lengthDependentMV i.e with minLength 1 was not provided');
    };
    GeneTrack.prototype.createModel = function () {
        var Model = this._getSettingsForLength().model.class;
        return new Model(this.browser);
    };
    GeneTrack.prototype.createView = function (properties) {
        var v = this._getSettingsForLength().view;
        var View = v.class;
        $.extend(properties, v.properties);
        this.viewProperties = properties;
        return new View(this.browser, properties);
    };
    return GeneTrack;
}(controller_1.default));
exports.default = GeneTrack;
