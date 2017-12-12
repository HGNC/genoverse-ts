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
var legend_1 = require("./../static/legend");
var gene_1 = require("./../gene");
var ensembl_1 = require("./../../view/gene/ensembl");
var ensembl_2 = require("./../../model/gene/ensembl");
var ensembl_3 = require("./../../view/transcript/ensembl");
var ensembl_4 = require("./../../model/transcript/ensembl");
var gene_2 = require("./../../../interfaces/gene");
var $ = require("jquery");
var EnsemblGeneTrack = (function (_super) {
    __extends(EnsemblGeneTrack, _super);
    function EnsemblGeneTrack(genoverse) {
        var _this = _super.call(this, genoverse, {
            name: EnsemblGeneTrack.Name,
            height: 200,
            legend: true,
            labels: true,
            margin: 2,
            resizable: true,
            lengthDependentMV: [
                {
                    minLength: 2000000,
                    model: {
                        class: ensembl_2.default
                    },
                    view: {
                        class: ensembl_1.default,
                        properties: { label: false }
                    }
                },
                {
                    minLength: 100000,
                    model: {
                        class: ensembl_2.default
                    },
                    view: {
                        class: ensembl_1.default,
                        properties: { label: true }
                    }
                },
                {
                    minLength: 1,
                    model: {
                        class: ensembl_4.default
                    },
                    view: {
                        class: ensembl_3.default,
                        properties: {
                            label: true,
                            featureHeight: 10,
                            labels: 'default',
                            repeatLabels: true,
                            bump: gene_2.Bump.True,
                            intronStyle: 'curve',
                            intronLineWidth: 0.5,
                            utrHeight: 7
                        }
                    }
                }
            ]
        }) || this;
        _this.legendType = 'EnsemblLegend';
        _this.modelStore = {
            'EnsemblTranscriptModel': undefined,
            'EnsemblGeneModel': undefined
        };
        _this.viewStore = {
            'EnsemblTranscriptView': undefined,
            'EnsemblGeneView': undefined
        };
        return _this;
    }
    EnsemblGeneTrack.prototype.init = function () {
        this.model = this.createModel();
        this.setDefaults();
        this.addDomElements();
        this.addUserEventHandlers();
        this.deferreds = [];
        this.view = this.createView();
    };
    EnsemblGeneTrack.prototype.makeFirstImage = function (moveTo) {
        var _this = this;
        this.modelStore[this.model.constructor.name] = this.model;
        this.viewStore[this.view.constructor.name] = this.view;
        var settings = this._getSettingsForLength();
        if (settings.model.class.name !== this.model.constructor.name) {
            if (this.modelStore[settings.model.class.name]) {
                this.model = this.modelStore[settings.model.class.name];
            }
            else {
                var Model = settings.model.class;
                this.model = new Model(this.browser);
            }
        }
        if (settings.view.class.name !== this.view.constructor.name) {
            if (this.viewStore[settings.view.class.name]) {
                this.view = this.viewStore[settings.view.class.name];
            }
            else {
                var View = settings.view.class;
                $.extend(this.viewProperties, settings.view.properties);
                this.view = new View(this.browser, this.viewProperties);
            }
        }
        this.setScale();
        var deferred = _super.prototype.makeFirstImage.call(this, moveTo);
        if (this.legend) {
            deferred.done(function () {
                _this.addLegend();
            });
        }
        return deferred;
    };
    EnsemblGeneTrack.prototype.addLegend = function () {
        if (!this.legend) {
            return;
        }
        var config = {
            id: this.legendType,
            name: 'Ensembl Gene Legend',
            type: this.legendType,
            width: this.width,
            height: 100,
            margin: 0
        };
        var track = this;
        if (this.legendTrack instanceof legend_1.default) {
            this.legendTrack.remove();
        }
        this.legendTrack = new legend_1.default(this.browser, config);
    };
    EnsemblGeneTrack.prototype.createView = function () {
        var prop = {
            margin: this.margin,
            height: this.height,
            featureHeight: 5,
            minLabelHeight: 29,
            width: this.width,
            labels: true,
            repeatLabels: true,
            bump: gene_2.Bump.True,
            resizable: this.resizable
        };
        return _super.prototype.createView.call(this, prop);
    };
    EnsemblGeneTrack.prototype.populateMenu = function (feature) {
        var url = 'http://www.ensembl.org/Homo_sapiens/' + (feature.feature_type === 'transcript' ? 'Transcript' : 'Gene') + '/Summary?' + (feature.feature_type === 'transcript' ? 't' : 'g') + '=' + feature.id;
        var menu = {
            title: '<a target="_blank" href="' + url + '">' + (feature.external_name ? feature.external_name + ' (' + feature.id + ')' : feature.id) + '</a>',
            Location: feature.chr + ':' + feature.start + '-' + feature.end,
            Source: feature.source,
            Biotype: feature.biotype
        };
        if (feature.feature_type === 'transcript') {
            menu.Gene = '<a target="_blank" href="http://www.ensembl.org/Homo_sapiens/Gene/Summary?g=' + feature.Parent + '">' + feature.Parent + '</a>';
        }
        return menu;
    };
    EnsemblGeneTrack.Name = 'Ensembl Genes';
    return EnsemblGeneTrack;
}(gene_1.default));
exports.default = EnsemblGeneTrack;
