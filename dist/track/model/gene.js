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
var GeneModel = (function (_super) {
    __extends(GeneModel, _super);
    function GeneModel(genoverse, properties) {
        return _super.call(this, genoverse, properties) || this;
    }
    GeneModel.prototype.parseData = function (data, chr) {
        for (var i = 0; i < data.length; i++) {
            var feature = data[i];
            if (feature.feature_type === 'gene' && !this.featuresById[feature.id]) {
                feature.chr = feature.chr || chr;
                feature.label = parseInt(feature.strand, 10) === 1 ? (feature.external_name || feature.id) + ' >' : '< ' + (feature.external_name || feature.id);
                feature.transcripts = [];
                this.insertFeature(feature);
            }
        }
    };
    return GeneModel;
}(model_1.default));
exports.default = GeneModel;
