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
var model_1 = require("../model");
var TranscriptModel = (function (_super) {
    __extends(TranscriptModel, _super);
    function TranscriptModel(genoverse, properties) {
        return _super.call(this, genoverse, properties) || this;
    }
    TranscriptModel.prototype.setDefaults = function () {
        this.geneIds = {};
        this.seenGenes = 0;
        _super.prototype.setDefaults.call(this);
    };
    return TranscriptModel;
}(model_1.default));
exports.default = TranscriptModel;
