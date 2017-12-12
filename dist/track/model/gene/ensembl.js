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
var EnsemblGeneModel = (function (_super) {
    __extends(EnsemblGeneModel, _super);
    function EnsemblGeneModel(genoverse) {
        return _super.call(this, genoverse, {
            url: '//rest.ensembl.org/overlap/region/human/__CHR__:__START__-__END__?feature=gene;content-type=application/json',
            dataRequestLimit: 5000000
        }) || this;
    }
    EnsemblGeneModel.prototype.receiveData = function (data, chr, start, end) {
        _super.prototype.receiveData.call(this, data, chr, start, end);
    };
    return EnsemblGeneModel;
}(gene_1.default));
exports.default = EnsemblGeneModel;
