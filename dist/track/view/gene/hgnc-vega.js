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
var HgncVegaGeneView = (function (_super) {
    __extends(HgncVegaGeneView, _super);
    function HgncVegaGeneView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HgncVegaGeneView.prototype.setFeatureColor = function (feature) {
        var processed_transcript = {
            'sense_intronic': 1,
            'sense_overlapping': 1,
            'processed_transcript': 1,
            'nonsense_mediated_decay': 1,
            'non_stop_decay': 1,
            'antisense': 1,
            'retained_intron': 1,
            'tec': 1,
            'non_coding': 1,
            'ambiguous_orf': 1,
            'disrupted_domain': 1,
            '3prime_overlapping_ncrna': 1
        };
        feature.color = '#000000';
        if (processed_transcript[feature.biotype]) {
            feature.color = '#0000FF';
            feature.legend = 'Processed transcript';
        }
        else if (feature.biotype === 'protein_coding') {
            feature.color = '#A00000';
            feature.legend = 'Protein coding';
        }
        else if (feature.biotype.indexOf('pseudogene') > -1) {
            feature.color = '#666666';
            feature.legend = 'Pseudogene';
        }
        else if (/rna/i.test(feature.biotype)) {
            feature.color = '#8B668B';
            feature.legend = 'RNA gene';
        }
        else if (/^tr_.+_gene$/i.test(feature.biotype)) {
            feature.color = '#CD6600';
            feature.legend = 'TR gene';
        }
        else if (/^ig_.+_gene$/i.test(feature.biotype)) {
            feature.color = '#8B4500';
            feature.legend = 'IG gene';
        }
        feature.labelColor = feature.color;
    };
    return HgncVegaGeneView;
}(gene_1.default));
exports.default = HgncVegaGeneView;
