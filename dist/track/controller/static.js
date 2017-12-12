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
var StaticTrack = (function (_super) {
    __extends(StaticTrack, _super);
    function StaticTrack(genoverse, properties) {
        var _this = _super.call(this, genoverse, properties) || this;
        _this.controls = 'off';
        _this.resizable = false;
        return _this;
    }
    StaticTrack.prototype.addDomElements = function () {
        _super.prototype.addDomElements.call(this);
        this.image = $('<img>').appendTo(this.imgContainer);
        this.container.toggleClass('gv-track-container gv-track-container-static').prepend(this.imgContainer);
        this.scrollContainer.add(this.messageContainer).remove();
    };
    StaticTrack.prototype.reset = function (type) {
        delete this.stringified;
        _super.prototype.reset.call(this, type);
    };
    StaticTrack.prototype.setWidth = function (width) {
        _super.prototype.setWidth.call(this, width);
        this.image.width(this.width);
    };
    StaticTrack.prototype.makeFirstImage = function (moveTo) {
        var def = _super.prototype.makeFirstImage.call(this, moveTo);
        this.container.css('left', 0);
        this.imgContainer.show();
        return def;
    };
    StaticTrack.prototype.makeImage = function (params) {
        if (this.disabled) {
            return $.Deferred().resolve();
        }
        var features = this.view.positionFeatures(this.model.findFeatures(params.chr, params.start, params.end), params);
        if (features) {
            var string = JSON.stringify(features);
            if (this.stringified !== string) {
                var height = this.height;
                params.width = this.width;
                params.featureHeight = height;
                this.render(features, this.image, params);
                this.imgContainer.children(':last').show();
                this.resize(height, undefined, false);
                this.stringified = string;
            }
        }
        return $.Deferred().resolve();
    };
    return StaticTrack;
}(controller_1.default));
exports.default = StaticTrack;
