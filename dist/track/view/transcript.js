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
var view_1 = require("../view");
var $ = require("jquery");
var TranscriptView = (function (_super) {
    __extends(TranscriptView, _super);
    function TranscriptView(genoverse, properties) {
        return _super.call(this, genoverse, properties) || this;
    }
    TranscriptView.prototype.drawBackground = function (feature, canvasContext, imgData) {
        $.noop;
    };
    TranscriptView.prototype.decorateFeature = function (feature, featureContext, scale) {
        $.noop;
    };
    TranscriptView.prototype.drawFeature = function (transcript, featureContext, labelContext, scale) {
        this.setFeatureColor(transcript);
        var exons = ($.isArray(transcript.exons) ? $.extend(true, [], transcript.exons) : $.map($.extend(true, {}, transcript.exons || {}), function (e) { return e; })).sort(function (a, b) { return a.start - b.start; });
        var cds = ($.isArray(transcript.cds) ? $.extend(true, [], transcript.cds) : $.map($.extend(true, {}, transcript.cds || {}), function (c) { return c; })).sort(function (a, b) { return a.start - b.start; });
        var add = Math.max(scale, this.widthCorrection);
        var coding = {};
        var cdsStart = 9e99;
        var cdsEnd = -9e99;
        var utrHeight = this.utrHeight;
        var utrOffset = (transcript.height - utrHeight) / 2;
        if (!exons.length || exons[0].start > transcript.start) {
            exons.unshift({ start: transcript.start, end: transcript.start });
        }
        if (!exons.length || exons[exons.length - 1].end < transcript.end) {
            exons.push({ start: transcript.end, end: transcript.end });
        }
        featureContext.fillStyle = featureContext.strokeStyle = transcript.color || this.color;
        for (var i = 0; i < cds.length; i++) {
            var x = transcript.x + (cds[i].start - transcript.start) * scale;
            var w = Math.max((cds[i].end - cds[i].start) * scale + add, this.minScaledWidth);
            coding[cds[i].start + ':' + cds[i].end] = true;
            cdsStart = Math.min(cdsStart, cds[i].start);
            cdsEnd = Math.max(cdsEnd, cds[i].end);
            if (x > this.width || x + w < 0) {
                continue;
            }
            featureContext.fillRect(x, transcript.y, w, transcript.height);
        }
        for (var i = 0; i < exons.length; i++) {
            if (!coding[exons[i].start + ':' + exons[i].end]) {
                var x = transcript.x + (exons[i].start - transcript.start) * scale;
                var w = Math.max((exons[i].end - exons[i].start) * scale + add, this.minScaledWidth);
                if (!(x > this.width || x + w < 0)) {
                    featureContext.lineWidth = 1;
                    featureContext.strokeRect(x, transcript.y + utrOffset, w, utrHeight);
                }
            }
            if (i) {
                var x = transcript.x + (exons[i - 1].end - transcript.start) * scale + add;
                var w = (exons[i].start - exons[i - 1].end) * scale - add;
                if (x > this.width || x + w < 0) {
                    continue;
                }
                this.drawIntron({
                    x: x,
                    y: transcript.y + transcript.height / 2,
                    width: w,
                    height: (transcript.height - (exons[i - 1].end >= cdsStart && exons[i].start <= cdsEnd ? 0 : 3)) / 2 * (transcript.strand > 0 ? -1 : 1)
                }, featureContext);
            }
        }
        if (this.labels && transcript.label) {
            this.drawLabel(transcript, labelContext, scale);
        }
    };
    TranscriptView.prototype.drawIntron = function (intron, context) {
        var coords = this.getTruncatedIntronCoords(intron);
        if (!coords) {
            return;
        }
        context.beginPath();
        context.moveTo(coords.x1, coords.y1);
        context.lineWidth = this.intronLineWidth;
        switch (this.intronStyle) {
            case 'line':
                context.lineTo(coords.x3, coords.y1);
                break;
            case 'hat':
                context.lineTo(coords.x2, coords.y2);
                context.lineTo(coords.x3, coords.y3);
                break;
            case 'curve':
                context.quadraticCurveTo(coords.x2, coords.y2, coords.x3, coords.y3);
                break;
            default: break;
        }
        context.stroke();
    };
    TranscriptView.prototype.getTruncatedIntronCoords = function (intron) {
        var y1 = intron.y;
        var y3 = y1;
        if (this.intronStyle === 'line') {
            this.truncateForDrawing(intron);
            y1 += 0.5;
        }
        var x1 = intron.x;
        var x3 = intron.x + intron.width;
        if (x3 < 0 || x1 > this.width) {
            return false;
        }
        var x2, y2, xMid, yScale;
        if (this.intronStyle === 'hat') {
            xMid = (x1 + x3) / 2;
            x2 = xMid;
            y2 = intron.y + intron.height;
            yScale = (y2 - y1) / (xMid - x1);
            if (xMid < 0) {
                y2 = intron.y + (yScale * x3);
                x2 = 0;
            }
            else if (xMid > this.width) {
                y2 = intron.y + (yScale * (this.width - intron.x));
                x2 = this.width;
            }
            if (x1 < 0) {
                y1 = xMid < 0 ? y2 : intron.y - (yScale * intron.x);
                x1 = 0;
            }
            if (x3 > this.width) {
                y3 = xMid > this.width ? y2 : y2 - (yScale * (this.width - x2));
                x3 = this.width;
            }
        }
        else if (this.intronStyle === 'curve') {
            x2 = intron.x + intron.width / 2;
            y2 = intron.y + intron.height;
        }
        return {
            x1: x1, y1: y1,
            x2: x2, y2: y2,
            x3: x3, y3: y3
        };
    };
    return TranscriptView;
}(view_1.default));
exports.default = TranscriptView;
