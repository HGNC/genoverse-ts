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
var gene_1 = require("./../gene");
var HgncNcbiGeneView = (function (_super) {
    __extends(HgncNcbiGeneView, _super);
    function HgncNcbiGeneView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HgncNcbiGeneView.prototype.setFeatureColor = function (feature) {
        if (feature.biotype === 'protein-coding') {
            feature.color = '#A00000';
            feature.legend = 'Protein coding';
        }
        else if (feature.biotype === 'pseudo') {
            feature.color = '#666666';
            feature.legend = 'Pseudogene';
        }
        else if (feature.biotype === 'biological-region') {
            feature.color = '#009933';
            feature.legend = 'Biological region';
        }
        else if (feature.biotype === 'other') {
            feature.color = '#ff8000';
            feature.legend = 'Other';
        }
        else if (/rna/i.test(feature.biotype)) {
            feature.color = '#8B668B';
            feature.legend = 'RNA gene';
        }
        else {
            feature.color = '#FF0000';
            feature.legend = 'Unknown';
        }
        feature.labelColor = feature.color;
    };
    return HgncNcbiGeneView;
}(gene_1.default));
exports.default = HgncNcbiGeneView;
