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
var model_1 = require("./../model");
var ChromosomeModel = (function (_super) {
    __extends(ChromosomeModel, _super);
    function ChromosomeModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.colors = {
            acen: '#708090',
            gneg: '#FFFFFF',
            gpos: '#000000',
            gpos100: '#000000',
            gpos25: '#D9D9D9',
            gpos33: '#BFBFBF',
            gpos50: '#999999',
            gpos66: '#7F7F7F',
            gpos75: '#666666',
            gvar: '#E0E0E0',
            stalk: '#708090'
        };
        _this.labelColors = {
            gneg: '#000000',
            gvar: '#000000',
            gpos25: '#000000',
            gpos33: '#000000'
        };
        return _this;
    }
    ChromosomeModel.prototype.insertFeature = function (feature) {
        feature.label = feature.type === 'acen' || feature.type === 'stalk' ? false : feature.id;
        feature.menuTitle = feature.id ? feature.chr + feature.id : feature.chr + ':' + feature.start + '-' + feature.end;
        feature.color = this.colors[feature.type] || '#FFFFFF';
        feature.labelColor = this.labelColors[feature.type] || '#FFFFFF';
        _super.prototype.insertFeature.call(this, feature);
    };
    ChromosomeModel.prototype.getData = function (chr, start, end) {
        this.receiveData($.extend(true, [], this.browser.genome[chr].bands), chr, start, end);
        return $.Deferred().resolveWith(this);
    };
    return ChromosomeModel;
}(model_1.default));
exports.default = ChromosomeModel;
