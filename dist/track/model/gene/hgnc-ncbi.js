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
var HgncNcbiGeneModel = (function (_super) {
    __extends(HgncNcbiGeneModel, _super);
    function HgncNcbiGeneModel(genoverse) {
        return _super.call(this, genoverse, {
            url: 'https://pace.genenames.org/cgi-bin/genoverse/ajax/genes-by-coord?chr=__CHR__&start=__START__&end=__END__&source=NCBI',
            dataRequestLimit: 5000000
        }) || this;
    }
    HgncNcbiGeneModel.prototype.receiveData = function (data, chr, start, end) {
        _super.prototype.receiveData.call(this, data, chr, start, end);
    };
    return HgncNcbiGeneModel;
}(gene_1.default));
exports.default = HgncNcbiGeneModel;
