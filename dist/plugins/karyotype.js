"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var genoverse_1 = require("../genoverse");
var chromosome_1 = require("./../track/controller/chromosome");
var $ = require("jquery");
require("./../lib/jquery-tipsy");
function create() {
    function createKaryotype() {
        var chromosome = $('<div class="gv-chromosome">');
        var container = $('<div class="gv-karyotype-container">').html(chromosome).insertBefore(this.wrapper);
        this.karyotype = new genoverse_1.default({
            parent: this,
            container: chromosome,
            width: chromosome.width(),
            genome: this.genome,
            chr: this.chr,
            start: 1,
            end: this.chromosomeSize,
            isStatic: true,
            tracks: [
                chromosome_1.default
            ],
            addUserEventHandlers: $.noop,
            afterInit: function () {
                this.updatePosition();
                this.viewPoint.fadeIn();
            },
            afterAddDomElements: function () {
                var karyotype = this;
                var parent = this.parent;
                function hideTooltip() {
                    karyotype.hideTooltip = true;
                    karyotype.track.container.tipsy('hide');
                }
                function updateLocation(e, ui) {
                    karyotype.hideTooltip = false;
                    if (e.type === 'resizestop') {
                        var axis = $(this).data('ui-resizable').axis;
                        if ((axis === 'e' && parent.end === karyotype.chromosomeSize) || (axis === 'w' && parent.start === 1)) {
                            return;
                        }
                    }
                    var scale = karyotype.chromosomeSize / karyotype.width;
                    var start = Math.max(Math.floor(ui.position.left * scale), 1);
                    var end = e.type === 'dragstop' ? start + parent.length - 1 : Math.floor(ui.helper.outerWidth(true) * scale) + start;
                    parent.moveTo(karyotype.chr, start, end, true, e.type === 'dragstop');
                }
                if (parent.karyotypeLabel === false) {
                    this.labelContainer.remove();
                    this.labelContainer = $();
                    container.addClass('gv-no-label');
                }
                karyotype.track = karyotype.tracks[0];
                this.viewPoint = $('<div class="gv-karyotype-viewpoint-wrapper"><div class="gv-karyotype-viewpoint"></div></div>').appendTo(container).children().on({
                    mousemove: function (e) { karyotype.track.click(e); },
                    mouseout: function (e) {
                        var el = $(e.relatedTarget);
                        if (karyotype.viewPoint.is(el) || karyotype.viewPoint.find(el).length || (el.nodeName === 'IMG' && el.parent().is(karyotype.track.imgContainers[0]))) {
                            return true;
                        }
                        karyotype.track.container.tipsy('hide');
                        karyotype.track.hoverFeature = false;
                    }
                });
                if (!parent.isStatic) {
                    this.viewPoint.draggable({
                        axis: 'x',
                        containment: this.wrapper,
                        start: hideTooltip,
                        stop: updateLocation
                    }).resizable({
                        handles: 'e, w',
                        containment: 'parent',
                        start: hideTooltip,
                        stop: updateLocation,
                        resize: function (e, ui) {
                            ui.element.css('left', Math.max(0, ui.position.left));
                            if (ui.position.left > 0) {
                                ui.element.width(Math.min(ui.size.width, ui.element.parent().width() - ui.position.left));
                            }
                            else {
                                ui.element.width(ui.size.width + ui.position.left);
                            }
                        }
                    });
                }
            },
            updatePosition: function () {
                var left = this.parent.start * this.scale;
                var width = (this.parent.end * this.scale) - left;
                this.viewPoint.css({ left: left, width: width });
            }
        }, 'karyotype');
        if (!this.loadedPlugins.controlPanel) {
            $('<li class="gv-unsortable">').height(function (i, h) {
                return h + container.height();
            }).prependTo(this.labelContainer);
        }
    }
    function recreateKaryotype() {
        var container = this.karyotype.container.parent();
        this.karyotype.destroy();
        container.remove();
        createKaryotype.call(this);
    }
    this.on({
        afterInit: createKaryotype,
        afterSetRange: function () {
            if (this.karyotype) {
                this.karyotype.updatePosition();
            }
        },
        afterSetWidth: recreateKaryotype,
        afterMoveTo: function (chr) {
            if (this.karyotype && this.karyotype.chr !== chr) {
                recreateKaryotype.call(this);
            }
        }
    });
}
;
var karyotype = {
    requires: ['controlPanel'],
    create: create
};
exports.default = karyotype;
