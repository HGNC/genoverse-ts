"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
require("jquery-ui");
var karyotype_1 = require("./plugins/karyotype");
var tooltips_1 = require("./plugins/tooltips");
var trackControls_1 = require("./plugins/trackControls");
var grch37_1 = require("./interfaces/genomes/grch37");
var grch38_1 = require("./interfaces/genomes/grch38");
var controlPanel_1 = require("./plugins/controlPanel");
var Genoverse = (function () {
    function Genoverse(config, type) {
        this.container = '#genoverse';
        this.urlParamTemplate = 'r=__CHR__:__START__-__END__';
        this.width = 1000;
        this.longestLabel = 30;
        this.defaultLength = 5000;
        this.defaultScrollDelta = 100;
        this.tracks = [];
        this.highlights = [];
        this.plugins = [];
        this.dragAction = 'scroll';
        this.wheelAction = 'off';
        this.isStatic = false;
        this.saveable = false;
        this.saveKey = '';
        this.storageType = 'sessionStorage';
        this.autoHideMessages = true;
        this.trackAutoHeight = false;
        this.hideEmptyTracks = true;
        this.genome = 'grch38';
        this.useHash = false;
        this.chr = '1';
        this.start = 1;
        this.end = 1000000;
        this.menuTemplate = $("<div class=\"gv-menu\">\n      <div class=\"gv-close gv-menu-button fa fa-times-circle\"></div>\n      <div class=\"gv-menu-loading\">Loading...</div>\n      <div class=\"gv-menu-content\">\n        <div class=\"gv-title\"></div>\n        <table></table>\n      </div>\n    </div>").on('click', function (e) {
            if ($(e.target).hasClass('gv-close')) {
                $(this).fadeOut('fast', function () {
                    var data = $(this).data();
                    if (data.track) {
                        data.track.menus = data.track.menus.not(this);
                    }
                    data.browser.menus = data.browser.menus.not(this);
                });
            }
        });
        var browser = this;
        this.type = type;
        this.tracksLoaded = false;
        if (!Genoverse.supported()) {
            this.die('Your browser does not support this functionality');
        }
        config = config || {};
        config.container = $(config.container);
        if (!(config.container && config.container.length)) {
            config.container = $('<div>').appendTo('body');
        }
        config.container.addClass('genoverse').data('genoverse', this);
        $.extend(this, config);
        this.eventNamespace = '.genoverse.' + (++Genoverse.id);
        this.events = { browser: {}, tracks: {} };
        this.loadGenome();
        this.loadPlugins();
        Genoverse.wrapFunctions(this);
        this.init();
    }
    Genoverse.supported = function () {
        var el = document.createElement('canvas');
        return !!(el.getContext && el.getContext('2d'));
    };
    Genoverse.wrapFunctions = function (obj) {
        for (var key in obj) {
            if (typeof obj[key] === 'function' && typeof obj[key].ancestor !== 'function' && !key.match(/^(base|extend|constructor|on|once|prop|loadPlugins|loadGenome)$/)) {
                Genoverse.functionWrap(key, obj);
            }
        }
    };
    Genoverse.functionWrap = function (key, obj) {
        obj.functions = obj.functions || {};
        if (obj.functions[key] || /^(before|after)/.test(key)) {
            return;
        }
        var func = key.substring(0, 1).toUpperCase() + key.substring(1);
        var mainObj = obj;
        var events = obj.events.browser;
        obj.functions[key] = obj[key];
        obj[key] = function () {
            var args = [].slice.call(arguments);
            var rtn;
            function trigger(when) {
                var once = events[when + func + '.once'] || [];
                var funcs = (events[when + func] || []).concat(once, typeof mainObj[when + func] === 'function' ? mainObj[when + func] : []);
                if (once.length) {
                    delete events[when + func + '.once'];
                }
                for (var i = 0; i < funcs.length; i++) {
                    funcs[i].apply(this, args);
                }
            }
            trigger.call(this, 'before');
            rtn = this.functions[key].apply(this, args);
            trigger.call(this, 'after');
            return rtn;
        };
    };
    Genoverse.prototype.loadGenome = function () {
        if (typeof this.genome === 'string') {
            var genomeName = this.genome;
            var Genome_1 = Genoverse.Genomes[genomeName];
            var gm = new Genome_1;
            this.genome = gm.chromosomes;
        }
    };
    Genoverse.prototype.loadPlugins = function (plugins) {
        var browser = this;
        plugins = plugins || this.plugins;
        this.loadedPlugins = this.loadedPlugins || {};
        for (var i in Genoverse.Plugins) {
            this.loadedPlugins[i] = this.loadedPlugins[i] || 'script';
        }
        function loadPlugin(plugin) {
            Genoverse.Plugins[plugin].create.call(browser);
        }
        function initializePlugin(plugin) {
            if (typeof Genoverse.Plugins[plugin].create !== 'function' || browser.loadedPlugins[plugin] === true) {
                return;
            }
            var requires = Genoverse.Plugins[plugin].requires;
            function init() {
                if (browser.loadedPlugins[plugin] !== true) {
                    Genoverse.Plugins[plugin].create.call(browser);
                    browser.container.addClass('gv-' + plugin.replace(/([A-Z])/g, '-$1').toLowerCase() + '-plugin');
                    browser.loadedPlugins[plugin] = true;
                }
            }
            if (Boolean(requires) && requires.length) {
                var newPlugin = false;
                for (var i = 0; i < requires.length; i++) {
                    if (plugins.indexOf(requires[i]) < 0) {
                        newPlugin = true;
                        plugins.push(requires[i]);
                    }
                }
                if (newPlugin)
                    browser.loadPlugins(plugins);
            }
            init();
        }
        $.map(plugins, loadPlugin);
        for (var i = 0; i < plugins.length; i++) {
            var plugin = plugins[i];
            if (browser.loadedPlugins[plugin] !== true) {
                initializePlugin(plugin);
            }
        }
    };
    Genoverse.prototype.init = function () {
        this.tracksById = {};
        this.prev = {};
        this.legends = {};
        var width = this.width;
        this.addDomElements(width);
        this.addUserEventHandlers();
        if (this.isStatic) {
            this.dragAction = this.wheelAction = 'off';
            this.urlParamTemplate = '';
        }
        this.saveKey = this.saveKey ? 'genoverse-' + this.saveKey : 'genoverse';
        this.urlParamTemplate = this.urlParamTemplate || '';
        this.useHash = typeof this.useHash === 'boolean' ? this.useHash : typeof window.history.pushState !== 'function';
        this.textWidth = document.createElement('canvas').getContext('2d').measureText('W').width;
        this.paramRegex = this.urlParamTemplate !== '' ? new RegExp('([?&;])' + this.urlParamTemplate
            .replace(/(\b(\w+=)?__CHR__(.)?)/, '$2([\\w\\.]+)$3')
            .replace(/(\b(\w+=)?__START__(.)?)/, '$2(\\d+)$3')
            .replace(/(\b(\w+=)?__END__(.)?)/, '$2(\\d+)$3') + '([;&])') : new RegExp('');
        var urlCoords = this.getURLCoords();
        var coords = urlCoords.chr && urlCoords.start && urlCoords.end ? urlCoords : { chr: this.chr, start: this.start, end: this.end };
        this.chr = coords.chr;
        if (this.genome) {
            this.chromosomeSize = this.genome[this.chr].size;
        }
        this.canChangeChr = !!this.genome;
        this.setRange(coords.start, coords.end);
    };
    Genoverse.prototype.loadConfig = function () {
        this.defaultTracks = $.extend([], true, this.tracks);
        var config = window[this.storageType].getItem(this.saveKey);
        if (config) {
            config = JSON.parse(config);
        }
        else {
            return this.addTracks();
        }
        var tracks = [];
        var tracksById = {};
        var savedConfig = {};
        var i, prop, track;
        function setConfig(track, conf) {
            for (prop in conf) {
                if (prop === 'config') {
                    savedConfig[conf.id] = conf[prop];
                }
                else {
                    track.prototype[prop] = conf[prop];
                }
            }
        }
        for (i = 0; i < this.tracks.length; i++) {
            if (this.tracks[i].prototype.id) {
                tracksById[this.tracks[i].prototype.id] = this.tracks[i];
            }
        }
        for (i = 0; i < this.tracks.length; i++) {
            if (this.tracks[i].prototype.id && !this.tracks[i]._fromStorage) {
                continue;
            }
            tracks.push(this.tracks[i]);
        }
        this.tracks = tracks;
        this.savedConfig = savedConfig;
        this.addTracks();
    };
    Genoverse.prototype.saveConfig = function () {
        if (this._constructing || !this.saveable) {
            return;
        }
        var config = [];
        try {
            window[this.storageType].setItem(this.saveKey, JSON.stringify(config));
        }
        catch (e) { }
    };
    Genoverse.prototype.resetConfig = function () {
        var unremovableHighlights = [];
        if (this.tracksById.highlights) {
            this.tracksById.highlights.removeHighlights();
            unremovableHighlights = $.map(this.tracksById.highlights.featuresById, function (h) { return h; });
        }
        window[this.storageType].removeItem(this.saveKey);
        this._constructing = true;
        this.savedConfig = {};
        this._constructing = false;
    };
    Genoverse.prototype.addDomElements = function (width) {
        this.menus = $();
        this.labelContainer = $('<ul class="gv-label-container">').addClass('WIBBLE').appendTo(this.container).sortable({
            items: 'li:not(.gv-unsortable)',
            handle: '.gv-handle',
            axis: 'y',
            helper: 'clone',
            cursor: 'move',
            start: function (e, ui) {
                ui.placeholder.css({ height: ui.item.height(), visibility: 'visible' }).html(ui.item.html());
                ui.helper.hide();
            }
        });
        this.labelWidth = this.labelContainer.outerWidth(true);
        this.width -= this.labelWidth;
        this.wrapper = $('<div class="gv-wrapper">').appendTo(this.container);
        this.selector = $('<div class="gv-selector gv-crosshair">').appendTo(this.wrapper);
        this.selectorControls = this.zoomInHighlight = this.zoomOutHighlight = $();
        this.container.addClass('gv-canvas-container').width(width);
        if (!this.isStatic) {
            this.selectorControls = $('<div class="gv-selector-controls gv-panel">' +
                '  <div class="gv-button-set">' +
                '  <div class="gv-position">' +
                '    <div class="gv-chr"></div>' +
                '    <div class="gv-start-end">' +
                '      <div class="gv-start"></div>' +
                '      <div class="gv-end"></div>' +
                '    </div>' +
                '  </div>' +
                '  </div>' +
                '  <div class="gv-button-set">' +
                '    <button class="gv-zoom-here">Zoom here</button>' +
                '  </div>' +
                '  <div class="gv-button-set">' +
                '    <button class="gv-center">Center</button>' +
                '  </div>' +
                '  <div class="gv-button-set">' +
                '    <button class="gv-highlight">Highlight</button>' +
                '  </div>' +
                '  <div class="gv-button-set">' +
                '    <button class="gv-cancel">Cancel</button>' +
                '  </div>' +
                '</div>').appendTo(this.selector);
            this.zoomInHighlight = $('<div class="gv-canvas-zoom gv-i">' +
                '  <div class="gv-t gv-l gv-h"></div>' +
                '  <div class="gv-t gv-r gv-h"></div>' +
                '  <div class="gv-t gv-l gv-v"></div>' +
                '  <div class="gv-t gv-r gv-v"></div>' +
                '  <div class="gv-b gv-l gv-h"></div>' +
                '  <div class="gv-b gv-r gv-h"></div>' +
                '  <div class="gv-b gv-l gv-v"></div>' +
                '  <div class="gv-b gv-r gv-v"></div>' +
                '</div>').appendTo('body');
            this.zoomOutHighlight = this.zoomInHighlight.clone().toggleClass('gv-i gv-o').appendTo('body');
        }
        if (!this.tracksLoaded && this.tracks) {
            for (var i = 0; i < this.tracks.length; i++) {
                this.tracks[i] = new this.tracks[i](this);
            }
            this.tracksLoaded = true;
        }
    };
    Genoverse.prototype.addUserEventHandlers = function () {
        var browser = this;
        var documentEvents = {};
        this.container.on({
            mousedown: function (e) {
                browser.hideMessages();
                if ((!e.which || e.which === 1) && !(this === browser.selector[0] && e.target !== this)) {
                    browser.mousedown(e);
                }
                return false;
            },
            mousewheel: function (e, delta, deltaX, deltaY) {
                if (browser.noWheelZoom) {
                    return true;
                }
                browser.hideMessages();
                if (deltaY === 0 && deltaX !== 0) {
                    browser.startDragScroll(e);
                    browser.move(-deltaX * 10);
                    browser.stopDragScroll(false);
                }
            },
            dblclick: function (e) {
                if (browser.isStatic) {
                    return true;
                }
                browser.hideMessages();
            }
        }, '.gv-image-container, .gv-selector');
        this.selectorControls.on('click', function (e) {
            var pos = browser.getSelectorPosition();
            switch (e.target.className) {
                case 'gv-zoom-here':
                    browser.setRange(pos.start, pos.end, true);
                    break;
                case 'gv-center':
                    browser.moveTo(browser.chr, pos.start, pos.end, true, true);
                    browser.cancelSelect();
                    break;
                case 'gv-cancel':
                    browser.cancelSelect();
                    break;
                default: break;
            }
        });
        documentEvents['mouseup' + this.eventNamespace] = $.proxy(this.mouseup, this);
        documentEvents['mousemove' + this.eventNamespace] = $.proxy(this.mousemove, this);
        $(document).on(documentEvents);
        $(window).on((this.useHash ? 'hashchange' : 'popstate') + this.eventNamespace, $.proxy(this.popState, this));
    };
    Genoverse.prototype.onTracks = function (key, value1, value2, value3, value4) {
        if (!this.tracksLoaded && this.tracks) {
            for (var i = 0; i < this.tracks.length; i++) {
                this.tracks[i] = new this.tracks[i](this);
            }
            this.tracksLoaded = true;
        }
        var args = $.extend([], arguments);
        var func = args.shift();
        if (args.length === 0) {
            args = undefined;
        }
        var len = this.tracks ? this.tracks.length : 0;
        for (var i = 0; i < len; i++) {
            if (this.tracks[i].disabled) {
                continue;
            }
            this.tracks[i][func](args);
        }
    };
    Genoverse.prototype.reset = function (type) {
        this.onTracks.apply(this, ['reset'].concat([].slice.call(arguments)));
        this.prev = {};
        this.scale = 9e99;
        this.setRange(this.start, this.end);
    };
    Genoverse.prototype.setWidth = function (width) {
        this.width = width;
        this.width -= this.labelWidth;
        if (this.controlPanel) {
            this.width -= this.controlPanel.width();
        }
        if (this.superContainer) {
            this.superContainer.width(width);
            this.container.width(this.width);
        }
        else {
            this.container.width(width);
        }
        this.onTracks('setWidth', this.width);
        this.reset('resizing');
    };
    Genoverse.prototype.startDragScroll = function (e) {
        this.dragging = 'scroll';
        this.scrolling = !e;
        this.dragOffset = e ? e.pageX - this.left : 0;
        this.dragStart = this.start;
        this.scrollDelta = Math.max(this.scale, this.defaultScrollDelta);
    };
    Genoverse.prototype.stopDragScroll = function (update) {
        this.dragging = undefined;
        this.scrolling = false;
        if (update !== false) {
            if (this.start !== this.dragStart) {
                this.updateURL();
            }
            this.checkTrackHeights();
        }
        for (var index = 0; index < this.tracks.length; index++) {
            if (typeof this.tracks[index].addLegend === "function") {
                this.tracks[index].addLegend();
            }
        }
    };
    Genoverse.prototype.cancelSelect = function (keepDragging) {
        this.selector.hide();
    };
    ;
    Genoverse.prototype.mousedown = function (e) {
        switch (this.dragAction) {
            case 'scroll':
                this.startDragScroll(e);
                break;
            default: break;
        }
    };
    Genoverse.prototype.mouseup = function (e) {
        if (!this.dragging) {
            return false;
        }
        switch (this.dragging) {
            case 'scroll':
                this.stopDragScroll();
                break;
            default: break;
        }
    };
    Genoverse.prototype.mousemove = function (e) {
        if (this.dragging && !this.scrolling) {
            switch (this.dragAction) {
                case 'scroll':
                    this.move(e.pageX - this.dragOffset - this.left);
                    break;
                default: break;
            }
        }
    };
    Genoverse.prototype.moveSelector = function (e) {
        if (!this.selectorStalled) {
            this.selector.css('left', e.pageX - this.wrapper.offset().left - 2);
        }
    };
    Genoverse.prototype.move = function (delta) {
        var scale = this.scale;
        var start, end, left;
        if (scale > 1) {
            delta = Math.round(delta / scale) * scale;
        }
        left = this.left + delta;
        if (left <= this.minLeft) {
            left = this.minLeft;
            delta = this.minLeft - this.left;
        }
        else if (left >= this.maxLeft) {
            left = this.maxLeft;
            delta = this.maxLeft - this.left;
        }
        start = Math.max(Math.round(this.start - delta / scale), 1);
        end = start + this.length - 1;
        if (end > this.chromosomeSize) {
            end = this.chromosomeSize;
            start = end - this.length + 1;
        }
        this.left = left;
        if (start !== this.dragStart) {
            this.closeMenus();
            this.cancelSelect(true);
        }
        this.onTracks('move', delta);
        this.setRange(start, end);
    };
    Genoverse.prototype.moveTo = function (chr, start, end, update, keepLength) {
        if (typeof chr !== 'undefined' && chr != this.chr) {
            if (this.canChangeChr) {
                if (this.genome && this.genome[chr]) {
                    this.chr = chr;
                    this.chromosomeSize = this.genome[chr].size;
                    this.start = this.end = this.scale = -1;
                }
                else {
                    this.die('Chromosome cannot be found in genome');
                }
                this.onTracks('changeChr');
            }
            else {
                this.die('Chromosome changing is not allowed');
            }
        }
        this.setRange(start, end, update, keepLength);
        if (this.prev.scale === this.scale) {
            this.left = Math.max(Math.min(this.left + Math.round((this.prev.start - this.start) * this.scale), this.maxLeft), this.minLeft);
            this.onTracks('moveTo', this.chr, this.start, this.end, (this.prev.start - this.start) * this.scale);
        }
    };
    Genoverse.prototype.setRange = function (start, end, update, keepLength) {
        this.prev.start = this.start;
        this.prev.end = this.end;
        this.start = Math.min(Math.max(typeof start === 'number' ? Math.floor(start) : parseInt(start, 10), 1), this.chromosomeSize);
        this.end = Math.max(Math.min(typeof end === 'number' ? Math.floor(end) : parseInt(end, 10), this.chromosomeSize), 1);
        if (this.end < this.start) {
            this.end = Math.min(this.start + this.defaultLength - 1, this.chromosomeSize);
        }
        if (keepLength && this.end - this.start + 1 !== this.length) {
            if (this.end === this.chromosomeSize) {
                this.start = this.end - this.length + 1;
            }
            else {
                var center = (this.start + this.end) / 2;
                this.start = Math.max(Math.floor(center - this.length / 2), 1);
                this.end = this.start + this.length - 1;
                if (this.end > this.chromosomeSize) {
                    this.end = this.chromosomeSize;
                    this.start = this.end - this.length + 1;
                }
            }
        }
        else {
            this.length = this.end - this.start + 1;
        }
        this.setScale();
        if (update === true && (this.prev.start !== this.start || this.prev.end !== this.end)) {
            this.updateURL();
        }
    };
    Genoverse.prototype.setScale = function () {
        this.prev.scale = this.scale;
        this.scale = this.width / this.length;
        this.scaledStart = this.start * this.scale;
        if (this.prev.scale !== this.scale) {
            this.left = 0;
            this.minLeft = Math.round((this.end - this.chromosomeSize) * this.scale);
            this.maxLeft = Math.round((this.start - 1) * this.scale);
            this.labelBuffer = Math.ceil(this.textWidth / this.scale) * this.longestLabel;
            if (this.prev.scale) {
                this.cancelSelect();
                this.closeMenus();
            }
            this.onTracks('setScale');
            this.onTracks('makeFirstImage');
        }
    };
    ;
    Genoverse.prototype.checkTrackHeights = function () {
        if (this.dragging) {
            return;
        }
        this.onTracks('checkHeight');
    };
    Genoverse.prototype.resetTrackHeights = function () {
        this.onTracks('resetHeight');
    };
    Genoverse.prototype.zoomIn = function (x) {
        if (!x) {
            x = this.width / 2;
        }
        var start = Math.round(this.start + x / (2 * this.scale));
        var end = this.length === 2 ? start : Math.round(start + (this.length - 1) / 2);
        this.setRange(start, end, true);
    };
    Genoverse.prototype.zoomOut = function (x) {
        if (!x) {
            x = this.width / 2;
        }
        var start = Math.round(this.start - x / this.scale);
        var end = this.length === 1 ? start + 1 : Math.round(start + 2 * (this.length - 1));
        this.setRange(start, end, true);
    };
    Genoverse.prototype.addTrack = function (track, after) {
        return this.addTracks([track], after)[0];
    };
    Genoverse.prototype.addTracks = function (tracks, after) {
        var defaults = {
            browser: this,
            width: this.width
        };
        var push = Boolean(tracks);
        var order;
        tracks = tracks || $.extend([], this.tracks);
        if (push && !$.grep(this.tracks, function (t) { return typeof t === 'function'; }).length) {
            var insertAfter = (after ? $.grep(this.tracks, function (t) {
                return t.order < after;
            }) : this.tracks)
                .sort(function (a, b) { return b.order - a.order; })[0];
            if (insertAfter) {
                order = insertAfter.order + 0.1;
            }
        }
        for (var i = 0; i < tracks.length; i++) {
            order = typeof order === 'number' ? order : i;
            var config = this.savedConfig ? $.extend(true, {}, this.savedConfig[tracks[i].prototype.id]) : undefined;
            tracks[i].order = order;
            tracks[i].config = config;
            if (tracks[i].id) {
                this.tracksById[tracks[i].id] = tracks[i];
            }
            if (push) {
                this.tracks.push(tracks[i]);
            }
            else {
                this.tracks[i] = tracks[i];
            }
        }
        return tracks;
    };
    Genoverse.prototype.removeTrack = function (track) {
        this.removeTracks([track]);
    };
    Genoverse.prototype.removeTracks = function (tracks) {
        var i = tracks.length;
        var track, j;
        while (i--) {
            track = tracks[i];
            j = this.tracks.length;
            while (j--) {
                if (track === this.tracks[j]) {
                    this.tracks.splice(j, 1);
                    break;
                }
            }
            if (track.id) {
                delete this.tracksById[track.id];
            }
            track.destructor();
        }
        this.saveConfig();
    };
    Genoverse.prototype.sortTracks = function () {
        if ($.grep(this.tracks, function (t) {
            return typeof t !== 'object';
        }).length) {
            return;
        }
        var sorted = $.extend([], this.tracks).sort(function (a, b) { return a.order - b.order; });
        var labels = [];
        var containers = [];
        for (var i = 0; i < sorted.length; i++) {
            if (sorted[i].parentTrack) {
                continue;
            }
            sorted[i].order = i;
            if (sorted[i].menus.length) {
                sorted[i].top = sorted[i].container.position().top;
            }
            labels.push(sorted[i].label[0]);
            containers.push(sorted[i].container[0]);
        }
        this.labelContainer.append(labels);
        this.wrapper.append(containers);
        this.tracks = sorted;
        labels
            .map(function (li) {
            return $(li).data('track');
        })
            .forEach(function (track) {
            if (track.menus.length) {
                var diff = track.container.position().top - track.top;
                track.menus.css('top', function (i, top) {
                    return parseInt(top, 10) + diff;
                });
                track.top = null;
            }
        });
        sorted = labels = containers = null;
    };
    Genoverse.prototype.updateTrackOrder = function (e, ui) {
        var track = ui.item.data('track');
        if (track.unsortable) {
            return;
        }
        var prev = ui.item.prev().data('track');
        var next = ui.item.next().data('track');
        var p = prev ? prev.order : 0;
        var n = next ? next.order : 0;
        var o = p || n;
        var order;
        if (prev && next && Math.floor(n) === Math.floor(p)) {
            order = p + (n - p) / 2;
        }
        else {
            order = o + (p ? 1 : -1) * Math.abs(Math.round(o) - o || 1) / 2;
        }
        track.order = order;
        this.sortTracks();
        this.saveConfig();
    };
    Genoverse.prototype.updateURL = function () {
        if (this.urlParamTemplate) {
            if (this.useHash) {
                window.location.hash = this.getQueryString();
            }
            else {
                window.history.pushState({}, '', this.getQueryString());
            }
        }
    };
    ;
    Genoverse.prototype.popState = function () {
        var coords = this.getURLCoords();
        var start = parseInt(coords.start, 10);
        var end = parseInt(coords.end, 10);
        if ((coords.chr && coords.chr != this.chr) ||
            (coords.start && !(start === this.start && end === this.end))) {
            this.moveTo(coords.chr, start, end);
        }
        this.closeMenus();
        this.hideMessages();
    };
    Genoverse.prototype.getURLCoords = function () {
        var match = ((this.useHash ? window.location.hash.replace(/^#/, '?') || window.location.search : window.location.search) + '&').match(this.paramRegex);
        var coords = {};
        var i = 0;
        if (!match) {
            return coords;
        }
        match = match.slice(2, -1);
        $.each(this.urlParamTemplate.split('__'), function () {
            var tmp = this.match(/^(CHR|START|END)$/);
            if (tmp) {
                coords[tmp[1].toLowerCase()] = tmp[1] === 'CHR' ? match[i++] : parseInt(match[i++], 10);
            }
        });
        return coords;
    };
    Genoverse.prototype.getQueryString = function () {
        var location = this.urlParamTemplate
            .replace('__CHR__', this.chr)
            .replace('__START__', this.start.toString())
            .replace('__END__', this.end.toString());
        return this.useHash ? location : window.location.search ? (window.location.search + '&').replace(this.paramRegex, '$1' + location + '$5').slice(0, -1) : '?' + location;
    };
    Genoverse.prototype.getChromosomeSize = function (chr) {
        return chr && this.genome && this.genome[chr] ? this.genome[chr].size : this.chromosomeSize;
    };
    Genoverse.prototype.die = function (error, el) {
        if (el && el.length) {
            el.html(error);
        }
        else {
            throw error;
        }
        this.failed = true;
    };
    Genoverse.prototype.makeMenu = function (features, event, track) {
        if (!features) {
            return false;
        }
        if (!$.isArray(features)) {
            features = [features];
        }
        if (features.length === 0) {
            return false;
        }
        else if (features.length === 1) {
            return this.makeFeatureMenu(features[0], event, track);
        }
        var browser = this;
        var menu = this.menuTemplate.clone(true).data({ browser: this });
        var table = $('.gv-menu-content', menu).addClass('gv-menu-content-first').find('table');
        $('.gv-focus, .gv-highlight, .gv-menu-loading', menu).remove();
        $('.gv-title', menu).html(features.length + ' features');
        $.each(features.sort(function (a, b) { return a.start - b.start; }), function (i, feature) {
            var location = feature.chr + ':' + feature.start + (feature.end === feature.start ? '' : '-' + feature.end);
            var title = feature.menuLabel || feature.name || ($.isArray(feature.label) ? feature.label.join(' ') : feature.label) || (feature.id + '');
            $('<a href="#">').html(title.match(location) ? title : (location + ' ' + title)).on('click', function (e) {
                browser.makeFeatureMenu(feature, e, track);
                return false;
            }).appendTo($('<td>').appendTo($('<tr>').appendTo(table)));
        });
        menu.appendTo(this.superContainer || this.container).show();
        if (event) {
            menu.css({ left: 0, top: 0 }).position({ of: event, my: 'left top', collision: 'flipfit' });
        }
        this.menus = this.menus.add(menu);
        if (track) {
            track.menus = track.menus.add(menu);
        }
        return menu;
    };
    Genoverse.prototype.makeFeatureMenu = function (feature, e, track) {
        var browser = this;
        var container = this.superContainer || this.container;
        var menu, table, content, loading, getMenu, isDeferred;
        var el, chr, start, end, linkData, key, columns, colspan;
        function focus() {
            var data = $(this).data();
            var length = data.end - data.start + 1;
            var context = Math.max(Math.round(length / 4), 25);
            browser.moveTo(data.chr, data.start - context, data.end + context, true);
            return false;
        }
        if (!feature.menuEl) {
            menu = browser.menuTemplate.clone(true).data({ browser: browser, feature: feature });
            content = $('.gv-menu-content', menu).remove();
            loading = $('.gv-menu-loading', menu);
            getMenu = track ? track.populateMenu(feature) : feature;
            isDeferred = typeof getMenu === 'object' && typeof getMenu.promise === 'function';
            if (isDeferred) {
                loading.show();
            }
            $.when(getMenu).done(function (properties) {
                if (!$.isArray(properties)) {
                    properties = [properties];
                }
                for (var i = 0; i < properties.length; i++) {
                    table = '';
                    el = content.clone().addClass(i ? '' : 'gv-menu-content-first').appendTo(menu);
                    chr = typeof properties[i].chr !== 'undefined' ? properties[i].chr : feature.chr;
                    start = parseInt(typeof properties[i].start !== 'undefined' ? properties[i].start : feature.start, 10);
                    end = parseInt(typeof properties[i].end !== 'undefined' ? properties[i].end : feature.end, 10);
                    columns = Math.max.apply(Math, $.map(properties[i], function (v) { return $.isArray(v) ? v.length : 1; }));
                    if (properties[i].title) {
                        $('.gv-title', el).html(properties[i].title);
                    }
                    else {
                        $('.gv-title', el).remove(properties[i].title);
                    }
                    if (track && start && end && !browser.isStatic) {
                        linkData = { chr: chr, start: start, end: Math.max(end, start), label: feature.label || (properties[i].title || '').replace(/<[^>]+>/g, ''), color: feature.color };
                        $('.gv-focus', el).data(linkData).on('click', focus);
                    }
                    else {
                        $('.gv-focus, .gv-highlight', el).remove();
                    }
                    for (key in properties[i]) {
                        if (/^start|end$/.test(key) && properties[i][key] === false) {
                            continue;
                        }
                        if (key !== 'title') {
                            colspan = properties[i][key] === '' ? ' colspan="' + (columns + 1) + '"' : '';
                            table += '<tr><td' + colspan + '>' + key + '</td>';
                            if (!colspan) {
                                if ($.isArray(properties[i][key])) {
                                    for (var j = 0; j < properties[i][key].length; j++) {
                                        table += '<td>' + properties[i][key][j] + '</td>';
                                    }
                                }
                                else if (columns === 1) {
                                    table += '<td>' + properties[i][key] + '</td>';
                                }
                                else {
                                    table += '<td colspan="' + columns + '">' + properties[i][key] + '</td>';
                                }
                            }
                            table += '</tr>';
                        }
                    }
                    if (table) {
                        $('table', el).html(table);
                    }
                    else {
                        $('table', el).remove(table);
                    }
                }
                if (isDeferred) {
                    loading.hide();
                }
            });
            if (track) {
                menu.addClass(track.id).data('track', track);
            }
            feature.menuEl = menu.appendTo(container);
        }
        else {
            feature.menuEl.appendTo(container);
        }
        browser.menus = browser.menus.add(feature.menuEl);
        if (track) {
            track.menus = track.menus.add(feature.menuEl);
        }
        feature.menuEl.show();
        if (e) {
            feature.menuEl.css({ left: 0, top: 0 }).position({ of: e, my: 'left top', collision: 'flipfit' });
        }
        return feature.menuEl;
    };
    Genoverse.prototype.closeMenus = function (obj) {
        obj = obj || this;
        obj.menus.filter(':visible').children('.gv-close').trigger('click');
        obj.menus = $();
    };
    Genoverse.prototype.hideMessages = function () {
        if (this.autoHideMessages) {
            this.wrapper.find('.gv-message-container').addClass('gv-collapsed');
        }
    };
    Genoverse.prototype.getSelectorPosition = function () {
        var left = this.selector.position().left;
        var width = this.selector.outerWidth(true);
        var start = Math.round(left / this.scale) + this.start;
        var end = Math.round((left + width) / this.scale) + this.start - 1;
        end = end <= start ? start : end;
        return { start: start, end: end, left: left, width: width };
    };
    Genoverse.prototype.on = function (events, obj, fn, once) {
        var browser = this;
        var eventMap = {};
        var f, fnString, event;
        function makeEventMap(types, handler) {
            var typesAry = types.split(' ');
            for (var j = 0; j < typesAry.length; j++) {
                eventMap[typesAry[j]] = (eventMap[typesAry[j]] || []).concat(handler);
            }
        }
        function makeFnString(func) {
            return func.toString();
        }
        function compare(func) {
            f = func.toString();
            for (var j = 0; j < fnString.length; j++) {
                if (f === fnString[j]) {
                    return true;
                }
            }
        }
        if (typeof events === 'object') {
            for (var i in events) {
                makeEventMap(i, events[i]);
            }
            obj = obj || this;
        }
        else {
            if (typeof fn === 'undefined') {
                fn = obj;
                obj = this;
            }
            makeEventMap(events, fn);
        }
        var type = 'browser';
        for (var i in eventMap) {
            event = i + (once ? '.once' : '');
            browser.events[type][event] = browser.events[type][event] || [];
            fnString = $.map(eventMap[i], makeFnString);
            if (!$.grep(browser.events[type][event], compare).length) {
                browser.events[type][event].push.apply(browser.events[type][event], eventMap[i]);
            }
        }
    };
    Genoverse.prototype.once = function (events, obj, fn) {
        this.on(events, obj, fn, true);
    };
    Genoverse.prototype.destroy = function () {
        this.onTracks('destructor');
        (this.superContainer || this.container).empty();
        if (this.zoomInHighlight) {
            this.zoomInHighlight.add(this.zoomOutHighlight).remove();
        }
        $(window).add(document).off(this.eventNamespace);
        for (var key in this) {
            delete this[key];
        }
    };
    Genoverse.id = 0;
    Genoverse.Genomes = {
        grch37: grch37_1.default,
        grch38: grch38_1.default
    };
    Genoverse.Plugins = {
        controlPanel: controlPanel_1.default,
        tooltips: tooltips_1.default,
        trackControls: trackControls_1.default,
        karyotype: karyotype_1.default
    };
    return Genoverse;
}());
exports.default = Genoverse;
