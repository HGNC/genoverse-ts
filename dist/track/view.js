"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
var rtree_1 = require("rtree");
var Bump;
(function (Bump) {
    Bump[Bump["False"] = 0] = "False";
    Bump[Bump["True"] = 1] = "True";
    Bump[Bump["Label"] = 2] = "Label";
})(Bump = exports.Bump || (exports.Bump = {}));
var TrackView = (function () {
    function TrackView(genoverse, properties) {
        this.fontHeight = 10;
        this.fontFamily = 'sans-serif';
        this.fontWeight = 'normal';
        this.color = '#000000';
        this.minScaledWidth = 0.5;
        this.widthCorrection = 1;
        this.labels = 'default';
        this.repeatLabels = false;
        this.bump = Bump.False;
        this.alwaysReposition = false;
        this.browser = genoverse;
        if (properties) {
            $.extend(this, properties);
        }
        this.init();
    }
    TrackView.prototype.init = function () {
        this.setDefaults();
        this.scaleSettings = {};
    };
    TrackView.prototype.setDefaults = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.featureMargin = this.featureMargin || { top: 3, right: 1, bottom: 1, left: 0 };
        var margin = ['top', 'right', 'bottom', 'left'];
        for (var i = 0; i < margin.length; i++) {
            if (typeof this.featureMargin[margin[i]] !== 'number') {
                this.featureMargin[margin[i]] = 0;
            }
        }
        this.context = $('<canvas>')[0].getContext('2d');
        this.featureHeight = typeof this.featureHeight !== 'undefined' ? this.featureHeight : undefined;
        if (!this.featureHeight)
            throw new Error("No height set");
        this.font = this.fontWeight + ' ' + this.fontHeight + 'px ' + this.fontFamily;
        this.labelUnits = ['bp', 'kb', 'Mb', 'Gb', 'Tb'];
        this.context.font = this.font;
        if (this.labels && this.labels !== 'overlay' && (this.depth || this.bump === Bump.Label)) {
            this.labels = 'separate';
        }
    };
    TrackView.prototype.setScaleSettings = function (scale) {
        var chr = this.browser.chr;
        if (!this.scaleSettings[chr]) {
            this.scaleSettings[chr] = {};
        }
        if (!this.scaleSettings[chr][scale]) {
            var featurePositions = new rtree_1.default();
            this.scaleSettings[chr][scale] = {
                imgContainers: $(),
                featurePositions: featurePositions,
                labelPositions: this.labels === 'separate' ? new rtree_1.default() : featurePositions
            };
        }
        return this.scaleSettings[chr][scale];
    };
    TrackView.prototype.scaleFeatures = function (features, scale) {
        var add = Math.max(scale, this.widthCorrection);
        var feature;
        for (var i = 0; i < features.length; i++) {
            feature = features[i];
            if (!feature.position) {
                feature.position = {};
            }
            if (!feature.position[scale]) {
                feature.position[scale] = {
                    start: feature.start * scale,
                    width: Math.max((feature.end - feature.start) * scale + add, this.minScaledWidth),
                    height: feature.height || this.featureHeight
                };
            }
        }
        return features;
    };
    TrackView.prototype.positionFeatures = function (features, params) {
        params.margin = this.margin;
        for (var i = 0; i < features.length; i++) {
            this.positionFeature(features[i], params);
        }
        params.width = Math.ceil(params.width);
        params.height = Math.ceil(params.height);
        params.featureHeight = Math.max(Math.ceil(params.featureHeight), this.resizable ? Math.max(this.height, this.minLabelHeight) : 0);
        params.labelHeight = Math.ceil(params.labelHeight);
        return features;
    };
    TrackView.prototype.positionFeature = function (feature, params) {
        var scale = params.scale;
        var scaleSettings = this.scaleSettings[feature.chr][scale];
        if (!scaleSettings) {
            return;
        }
        feature.position[scale].X = feature.position[scale].start - params.scaledStart;
        if (this.alwaysReposition || !feature.position[scale].positioned) {
            feature.position[scale].H = feature.position[scale].height + this.featureMargin.bottom;
            feature.position[scale].W = feature.position[scale].width + (feature.marginRight || this.featureMargin.right);
            feature.position[scale].Y = (typeof feature.position[scale].y === 'number' ? feature.position[scale].y :
                typeof feature.y === 'number' ? feature.y * feature.position[scale].H : 0) + (feature.marginTop || this.featureMargin.top);
            if (feature.label) {
                if (typeof feature.label === 'string') {
                    feature.label = feature.label.split('\n');
                }
                var context = this.context;
                feature.labelHeight = feature.labelHeight || (this.fontHeight + 2) * feature.label.length;
                feature.labelWidth = feature.labelWidth || Math.max.apply(Math, $.map(feature.label, function (l) { return Math.ceil(context.measureText(l).width); })) + 1;
                if (this.labels === true || this.labels === 'default') {
                    feature.position[scale].H += feature.labelHeight;
                    feature.position[scale].W = Math.max(feature.labelWidth, feature.position[scale].W);
                }
                else if (this.labels === 'separate' && !feature.position[scale].label) {
                    feature.position[scale].label = {
                        x: feature.position[scale].start,
                        y: feature.position[scale].Y,
                        w: feature.labelWidth,
                        h: feature.labelHeight
                    };
                }
            }
            var bounds = {
                x: feature.position[scale].start,
                y: feature.position[scale].Y,
                w: feature.position[scale].W,
                h: feature.position[scale].H + (feature.marginTop || this.featureMargin.top)
            };
            feature.position[scale].bounds = bounds;
            if (this.bump === Bump.True) {
                this.bumpFeature(bounds, feature, scale, scaleSettings.featurePositions);
            }
            scaleSettings.featurePositions.insert(bounds, feature);
            feature.position[scale].bottom = feature.position[scale].Y + bounds.h + params.margin;
            feature.position[scale].positioned = true;
        }
        if (this.labels === 'separate' && feature.position[scale].label) {
            if (this.alwaysReposition || !feature.position[scale].label.positioned) {
                this.bumpFeature(feature.position[scale].label, feature, scale, scaleSettings.labelPositions);
                feature.position[scale].label.bottom = feature.position[scale].label.y + feature.position[scale].label.h + params.margin;
                feature.position[scale].label.positioned = true;
                scaleSettings.labelPositions.insert(feature.position[scale].label, feature);
            }
            params.labelHeight = Math.max(params.labelHeight, feature.position[scale].label.bottom);
        }
        params.featureHeight = Math.max(params.featureHeight, feature.position[scale].bottom);
        params.height = Math.max(params.height, params.featureHeight + params.labelHeight);
    };
    TrackView.prototype.bumpFeature = function (bounds, feature, scale, tree) {
        var depth = 0;
        var scaleSettings = this.scaleSettings[feature.chr][scale];
        var labels = tree === scaleSettings.labelPositions && tree !== scaleSettings.featurePositions;
        var bump, clash;
        do {
            if (this.depth && ++depth >= this.depth) {
                if (!labels && $.grep(scaleSettings.featurePositions.search(bounds), function (f) { return f.position[scale].visible !== false; }).length) {
                    feature.position[scale].visible = false;
                }
                break;
            }
            bump = Bump.False;
            clash = tree.search(bounds)[0];
            if (clash && clash.id !== feature.id) {
                bounds.y = clash.position[scale][labels ? 'label' : 'bounds'].y + clash.position[scale][labels ? 'label' : 'bounds'].h;
                bump = Bump.True;
            }
        } while (bump !== Bump.False);
        if (!labels) {
            feature.position[scale].Y = bounds.y;
        }
    };
    TrackView.prototype.draw = function (features, featureContext, labelContext, scale) {
        var feature, f;
        for (var i = 0; i < features.length; i++) {
            feature = features[i];
            if (feature.position[scale].visible !== false) {
                f = $.extend({}, feature, {
                    x: feature.position[scale].X,
                    y: feature.position[scale].Y,
                    width: feature.position[scale].width,
                    height: feature.position[scale].height,
                    labelPosition: feature.position[scale].label
                });
                this.drawFeature(f, featureContext, labelContext, scale);
                if (f.legend !== feature.legend) {
                    feature.legend = f.legend;
                    feature.legendColor = f.color;
                }
            }
        }
    };
    TrackView.prototype.drawFeature = function (feature, featureContext, labelContext, scale) {
        if (feature.x < 0 || feature.x + feature.width > this.width) {
            this.truncateForDrawing(feature);
        }
        if (feature.color !== false) {
            if (!feature.color) {
                this.setFeatureColor(feature);
            }
            featureContext.fillStyle = feature.color;
            featureContext.fillRect(feature.x, feature.y, feature.width, feature.height);
        }
        if (feature.clear === true) {
            featureContext.clearRect(feature.x, feature.y, feature.width, feature.height);
        }
        if (this.labels && feature.label) {
            this.drawLabel(feature, labelContext, scale);
        }
        if (feature.borderColor) {
            featureContext.strokeStyle = feature.borderColor;
            featureContext.strokeRect(feature.x, feature.y + 0.5, feature.width, feature.height);
        }
        if (feature.decorations) {
            this.decorateFeature(feature, featureContext, scale);
        }
    };
    TrackView.prototype.drawLabel = function (feature, context, scale) {
        var original = feature.untruncated;
        var width = (original || feature).width;
        if (this.labels === 'overlay' && feature.labelWidth >= Math.floor(width)) {
            return;
        }
        if (feature.labelPosition) {
            context.labelPositions = context.labelPositions || new rtree_1.default();
        }
        if (typeof feature.label === 'string') {
            feature.label = [feature.label];
        }
        var x = (original || feature).x;
        var n = this.repeatLabels ? Math.ceil((width - Math.max(scale, 1) - (this.labels === 'overlay' ? feature.labelWidth : 0)) / this.width) || 1 : 1;
        var spacing = width / n;
        var label, start, j, y, currentY, h;
        if (this.repeatLabels && (scale > 1 || this.labels !== 'overlay')) {
            spacing = this.browser.length * scale;
            n = Math.ceil(width / spacing);
        }
        if (!feature.labelColor) {
            this.setLabelColor(feature);
        }
        context.fillStyle = feature.labelColor;
        if (this.labels === 'overlay') {
            label = [feature.label.join(' ')];
            y = feature.y + (feature.height + 1) / 2;
            h = 0;
        }
        else {
            label = feature.label;
            y = feature.labelPosition ? feature.labelPosition.y : feature.y + feature.height + this.featureMargin.bottom;
            h = this.fontHeight + 2;
        }
        var i = context.textAlign === 'center' ? 0.5 : 0;
        var offset = feature.labelWidth * i;
        if (n > 1) {
            i += Math.max(Math.floor(-(feature.labelWidth + x) / spacing), 0);
        }
        for (; i < n; i++) {
            start = x + (i * spacing);
            if (start + feature.labelWidth >= 0) {
                if ((start - offset > this.width) || (i >= 1 && start + feature.labelWidth > feature.position[scale].X + feature.position[scale].width)) {
                    break;
                }
                for (j = 0; j < label.length; j++) {
                    currentY = y + (j * h);
                    if (context.labelPositions && context.labelPositions.search({ x: start, y: currentY, w: feature.labelWidth, h: h }).length) {
                        feature.position[scale].label.visible = false;
                        continue;
                    }
                    context.fillText(label[j], start, currentY);
                    if (context.labelPositions) {
                        context.labelPositions.insert({ x: start, y: currentY, w: feature.labelWidth, h: h }, label[j]);
                    }
                }
            }
        }
    };
    TrackView.prototype.setFeatureColor = function (feature) {
        feature.color = this.color;
    };
    TrackView.prototype.setLabelColor = function (feature) {
        feature.labelColor = this.fontColor || feature.color || this.color;
    };
    TrackView.prototype.shadeColor = function (color, percent) {
        var f = parseInt(color.slice(1), 16);
        var R = f >> 16;
        var G = f >> 8 & 0x00FF;
        var B = f & 0x0000FF;
        return '#' + (0x1000000 +
            (Math.round((255 - R) * percent) + R) * 0x10000 +
            (Math.round((255 - G) * percent) + G) * 0x100 +
            (Math.round((255 - B) * percent) + B)).toString(16).slice(1);
    };
    TrackView.prototype.truncateForDrawing = function (feature) {
        var start = Math.min(Math.max(feature.x, -1), this.width + 1);
        var width = feature.x - start + feature.width;
        if (width + start > this.width) {
            width = this.width - start + 1;
        }
        feature.untruncated = { x: feature.x, width: feature.width };
        feature.x = start;
        feature.width = Math.max(width, 0);
    };
    TrackView.prototype.formatLabel = function (label) {
        var power = Math.floor((label.toString().length - 1) / 3);
        var unit = this.labelUnits[power];
        label /= Math.pow(10, power * 3);
        return Math.floor(label) + (unit === 'bp' ? '' : '.' + (label.toString().split('.')[1] || '').concat('00').substring(0, 2)) + ' ' + unit;
    };
    return TrackView;
}());
exports.default = TrackView;
