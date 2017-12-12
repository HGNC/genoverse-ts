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
var transcript_1 = require("./../transcript");
var EnsemblTranscriptModel = (function (_super) {
    __extends(EnsemblTranscriptModel, _super);
    function EnsemblTranscriptModel(genoverse) {
        return _super.call(this, genoverse, {
            url: '//rest.ensembl.org/overlap/region/human/__CHR__:__START__-__END__?feature=transcript;feature=exon;feature=cds;content-type=application/json',
            dataRequestLimit: 5000000
        }) || this;
    }
    EnsemblTranscriptModel.prototype.parseData = function (data, chr) {
        for (var i = 0; i < data.length; i++) {
            var feature = data[i];
            if (feature.feature_type === 'transcript' && !this.featuresById[feature.id]) {
                this.geneIds[feature.Parent] = this.geneIds[feature.Parent] || ++this.seenGenes;
                feature.chr = feature.chr || chr;
                feature.label = parseInt(feature.strand, 10) === 1 ? (feature.external_name || feature.id) + ' >' : '< ' + (feature.external_name || feature.id);
                feature.sort = (this.geneIds[feature.Parent] * 1e10) + (feature.logic_name.indexOf('ensembl_havana') === 0 ? 0 : 2e9) + (feature.biotype === 'protein_coding' ? 0 : 1e9) + feature.start + i;
                feature.exons = {};
                feature.cds = {};
                this.insertFeature(feature);
            }
            else if (feature.feature_type === 'exon' && this.featuresById[feature.Parent]) {
                if (!this.featuresById[feature.Parent].exons[feature.id]) {
                    this.featuresById[feature.Parent].exons[feature.id] = feature;
                }
            }
            else if (feature.feature_type === 'cds' && this.featuresById[feature.Parent]) {
                feature.id = feature.chr + ':' + feature.start + '-' + feature.end;
                if (!this.featuresById[feature.Parent].cds[feature.id]) {
                    this.featuresById[feature.Parent].cds[feature.id] = feature;
                }
            }
        }
    };
    EnsemblTranscriptModel.prototype.receiveData = function (data, chr, start, end) {
        _super.prototype.receiveData.call(this, data, chr, start, end);
    };
    return EnsemblTranscriptModel;
}(transcript_1.default));
exports.default = EnsemblTranscriptModel;
