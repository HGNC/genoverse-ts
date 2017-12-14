"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var genoverse_1 = require("./genoverse");
var scalebar_1 = require("./track/controller/scalebar");
var ensembl_1 = require("./track/controller/gene/ensembl");
var hgnc_ensembl_1 = require("./track/controller/gene/hgnc-ensembl");
var hgnc_ncbi_1 = require("./track/controller/gene/hgnc-ncbi");
var hgnc_vega_1 = require("./track/controller/gene/hgnc-vega");
document.addEventListener('DOMContentLoaded', function () {
    var genoverseConfig = {
        container: '#genoverse',
        width: 800,
        genome: 'grch38',
        chr: 13,
        start: 32296945,
        end: 32420516,
        useHash: false,
        urlParamTemplate: false,
        trackAutoHeight: true,
        plugins: ['controlPanel', 'karyotype'],
        tracks: [
            scalebar_1.default,
            hgnc_ensembl_1.default,
            hgnc_ncbi_1.default,
            hgnc_vega_1.default
        ],
        libraryTracks: [
            ensembl_1.default
        ]
    };
    new genoverse_1.default(genoverseConfig, 'main');
}, false);
