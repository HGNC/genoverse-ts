"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
var TrackController = (function () {
    function TrackController(genoverse, properties) {
        this.scrollBuffer = 1.2;
        this.threshold = Infinity;
        this.clickTolerance = 0;
        this.browser = genoverse;
        this.border = true;
        if (properties !== null && typeof properties === 'object') {
            $.extend(this, properties);
        }
    }
    TrackController.prototype.setDefaults = function () {
        this.config = this.config || {};
        this.configSettings = this.configSettings || {};
        this.defaultConfig = this.defaultConfig || {};
        this.controls = this.controls || [];
        this.defaultHeight = this.height;
        this.defaultAutoHeight = this.autoHeight;
        this.autoHeight = typeof this.autoHeight !== 'undefined' ? this.autoHeight : this.browser.trackAutoHeight;
        this.hideEmpty = typeof this.hideEmpty !== 'undefined' ? this.hideEmpty : this.browser.hideEmptyTracks;
        this.height += this.margin;
        this.initialHeight = this.height;
        if (this.resizable === 'auto') {
            this.autoHeight = true;
        }
        this.imgRange = {};
        this.scrollRange = {};
        this.messages = this.messages || {
            error: 'ERROR: ',
            threshold: 'Data for this track is not displayed in regions greater than ',
            resize: 'Some features are currently hidden, <a class="gv-resize">resize to see all</a>'
        };
        this.setDefaultConfig();
    };
    TrackController.prototype.setDefaultConfig = function () {
        for (var i in this.defaultConfig) {
            if (typeof this.config[i] === 'undefined') {
                this.config[i] = this.defaultConfig[i];
            }
        }
        this._setCurrentConfig();
    };
    TrackController.prototype._setCurrentConfig = function () {
        var settings = {};
        var featureFilters = [];
        var conf;
        this._currentConfig = { prop: {}, func: {} };
        for (var i in this.configSettings) {
            conf = this.getConfig(i);
            if (conf) {
                settings.push(conf);
                if (conf.featureFilter) {
                    featureFilters.push(conf.featureFilter);
                }
            }
        }
        this.model.featureFilters = featureFilters;
        if (settings.length) {
            settings = $.extend.apply($, [true, {}].concat(settings, { featureFilters: featureFilters }));
            delete settings.featureFilter;
        }
        for (var i in settings) {
            this._currentConfig[typeof settings[i] === 'function' && !/^(before|after)/.test(i) ? 'func' : 'prop'][i] = settings[i];
        }
    };
    TrackController.prototype.getConfig = function (type) {
        return this.configSettings[type][this.config[type]];
    };
    TrackController.prototype.setHeight = function (height, forceShow) {
        if (this.disabled || (forceShow !== true && height < this.featureHeight) || (this.threshold) && !this.thresholdMessage && this.browser.length > this.threshold) {
            height = 0;
        }
        else {
            height = Math.max(height, this.minLabelHeight);
        }
        this.height = height;
        return height;
    };
    TrackController.prototype.changeChr = function () {
        for (var i in this.models) {
            this.models[i].setChrProps();
        }
    };
    TrackController.prototype.updateName = function (name) {
        this.setName(name);
    };
    TrackController.prototype.enable = function () {
        if (this.disabled === true) {
            this.disabled = false;
            this.resize(this.initialHeight);
            this.reset();
        }
    };
    TrackController.prototype.disable = function () {
        if (!this.disabled) {
            this.disabled = true;
            this.resize(0);
        }
    };
    TrackController.prototype.reset = function (type) {
        for (var i in this.models) {
            if (this.models[i].url !== false) {
                this.models[i].init(true);
            }
        }
        for (var i in this.views) {
            this.views[i].init();
        }
        this.abort();
        this.setDefaults();
        this.resetImages();
        this.browser.closeMenus(this);
        if (type !== 'resizing') {
            this.setScale();
            this.makeFirstImage();
        }
    };
    TrackController.prototype.remove = function () {
        this.browser.removeTrack(this);
    };
    TrackController.prototype.destructor = function () {
        this.destroy();
        var view = this.view, model = this.model, controller = this;
        var objs = [view, model, controller];
        for (var i = 0; i < objs.length; i++) {
            for (var key in objs[i]) {
                delete objs[i][key];
            }
        }
    };
    TrackController.prototype.resetImages = function () {
        this.scrollContainer.empty();
        this.resetImageRanges();
    };
    TrackController.prototype.resetImageRanges = function () {
        this.left = 0;
        this.scrollStart = ['ss', this.browser.chr, this.browser.start, this.browser.end].join('-');
        this.imgRange[this.scrollStart] = this.imgRange[this.scrollStart] || { left: this.width * -2, right: this.width * 2 };
        this.scrollRange[this.scrollStart] = this.scrollRange[this.scrollStart] || { start: this.browser.start - this.browser.length, end: this.browser.end + this.browser.length };
    };
    TrackController.prototype.setName = function (name) {
        this.name = name;
        this.labelName = this.labelName || $('<span class="gv-name">').appendTo(this.label);
        this.labelName.attr('title', name).html(name);
        this.minLabelHeight = Math.max(this.labelName.outerHeight(true), this.labelName.outerHeight());
        if (this.minLabelHeight) {
            this.label.height(this.disabled ? 0 : Math.max(this.height, this.minLabelHeight));
        }
    };
    TrackController.prototype.addDomElements = function () {
        var name = this.name || '';
        this.menus = $();
        this.container = $('<div class="gv-track-container">').appendTo(this.browser.wrapper);
        var classTag = name || 'Scalebar';
        this.container.addClass("TRACK-" + classTag);
        this.scrollContainer = $('<div class="gv-scroll-container">').appendTo(this.container);
        this.imgContainer = $('<div class="gv-image-container">').width(this.width).addClass(this.invert ? 'gv-invert' : '');
        this.messageContainer = $('<div class="gv-message-container"><div class="gv-messages"></div><span class="gv-control gv-collapse">&laquo;</span><span class="gv-control gv-expand">&raquo;</span></div>').appendTo(this.container);
        this.label = $('<li>').appendTo(this.browser.labelContainer).height(this.height).data('track', this);
        this.context = $('<canvas>')[0].getContext('2d');
        if (this.border) {
            $('<div class="gv-track-border">').appendTo(this.container);
        }
        if (this.unsortable) {
            this.label.addClass('gv-unsortable');
        }
        else {
            $('<div class="gv-handle">').appendTo(this.label);
        }
        this.setName(name);
        this.container.height(this.disabled ? 0 : Math.max(this.height, this.minLabelHeight));
    };
    TrackController.prototype.addUserEventHandlers = function () {
        var controller = this;
        var browser = this.browser;
        this.container.on('mouseup', '.gv-image-container', function (e) {
            if ((e.which && e.which !== 1) || (typeof browser.dragStart === 'number' && browser.start !== browser.dragStart) || (browser.dragAction === 'select' && browser.selector.outerWidth(true) > 2)) {
                return;
            }
            controller.click(e);
        });
        this.messageContainer.children().on('click', function () {
            var collapsed = controller.messageContainer.children('.gv-messages').is(':visible') ? ' gv-collapsed' : '';
            var code = controller.messageContainer.find('.gv-msg').data('code');
            controller.messageContainer.attr('class', 'gv-message-container' + collapsed);
            controller.checkHeight();
            if (code !== 'error') {
                document.cookie = ['gv_msg', code, controller.id].join('_') + '=1; expires=' + (collapsed ? 'Tue, 19 Jan 2038' : 'Thu, 01 Jan 1970') + ' 00:00:00 GMT; path=/';
            }
        });
    };
    TrackController.prototype.click = function (e) {
        var target = $(e.target);
        var x = e.pageX - this.container.parent().offset().left + this.browser.scaledStart;
        var y = e.pageY - target.offset().top;
        if (this.imgContainer.hasClass('gv-invert')) {
            y = target.height() - y;
        }
        return this.browser.makeMenu(this.getClickedFeatures(x, y, target), e, this);
    };
    TrackController.prototype.getClickedFeatures = function (x, y, target) {
        var bounds = { x: x, y: y, w: 1, h: 1 };
        var scale = this.scale;
        var tolerance = scale < 1 ? this.clickTolerance : 0;
        if (tolerance) {
            bounds.x -= tolerance / 2;
            bounds.w += tolerance;
        }
        var features = this[target && target.hasClass('gv-labels') ? 'labelPositions' : 'featurePositions'].search(bounds);
        if (tolerance) {
            return features.sort(function (a, b) { return Math.abs(a.position[scale].start - x) - Math.abs(b.position[scale].start - x); });
        }
        else {
            return this.model.sortFeatures(features);
        }
    };
    TrackController.prototype.showMessage = function (code, additionalText) {
        var messages = this.messageContainer.children('.gv-messages');
        if (!messages.children('.gv-' + code).show().length) {
            var msg = $('<div class="gv-msg gv-' + code + '">' + this.messages[code] + (additionalText || '') + '</div>').data('code', code).prependTo(messages);
            if (code === 'resize') {
                msg.children('a.gv-resize').on('click', $.proxy(function () {
                    this.resize(this.fullVisibleHeight);
                }, this));
            }
            this.messageContainer[document.cookie.match(['gv_msg', code, this.id].join('_') + '=1') ? 'addClass' : 'removeClass']('gv-collapsed');
        }
        var height = this.messageContainer.show().outerHeight(true);
        if (height > this.height) {
            this.resize(height, undefined, false);
        }
        messages = null;
    };
    TrackController.prototype.hideMessage = function (code) {
        var messages = this.messageContainer.find('.gv-msg');
        if (code) {
            messages = messages.filter('.gv-' + code).hide();
            if (messages.length && !messages.siblings().filter(function () { return this.style.display !== 'none'; }).length) {
                this.messageContainer.hide();
            }
        }
        else {
            messages.hide();
            this.messageContainer.hide();
        }
        messages = null;
    };
    TrackController.prototype.showError = function (error) {
        this.showMessage('error', error);
    };
    TrackController.prototype.checkHeight = function () {
        if (this.browser.length > this.threshold) {
            if (this.thresholdMessage) {
                this.showMessage('threshold', this.thresholdMessage);
                this.fullVisibleHeight = Math.max(this.messageContainer.outerHeight(true), this.minLabelHeight);
            }
            else {
                this.fullVisibleHeight = 0;
            }
        }
        else if (this.thresholdMessage) {
            this.hideMessage('threshold');
        }
        if (!this.resizable) {
            return;
        }
        var autoHeight;
        if (this.browser.length > this.threshold) {
            autoHeight = this.autoHeight;
            this.autoHeight = true;
        }
        else {
            this.fullVisibleHeight = this.visibleFeatureHeight() || (this.messageContainer.is(':visible') ? this.messageContainer.outerHeight(true) : this.hideEmpty ? 0 : this.minLabelHeight);
        }
        this.autoResize();
        if (typeof autoHeight !== 'undefined') {
            this.autoHeight = autoHeight;
        }
    };
    TrackController.prototype.visibleFeatureHeight = function () {
        var bounds = { x: this.browser.scaledStart, w: this.width, y: 0, h: 9e99 };
        var scale = this.scale;
        var features = this.view.scaleSettings[this.browser.chr][this.scale].featurePositions.search(bounds);
        var minHeight = this.hideEmpty ? 0 : this.minLabelHeight;
        var height = Math.max.apply(Math, $.map(features, function (feature) {
            return feature.position[scale].bottom;
        }).concat(minHeight));
        if (this.labels === 'separate') {
            this.labelTop = height;
            height += Math.max.apply(Math, $.map(this.labelPositions.search(bounds).concat(this.repeatLabels ? features : []), function (feature) { return feature.position[scale].label.bottom; }).concat(minHeight));
        }
        return height;
    };
    TrackController.prototype.autoResize = function () {
        var autoHeight = this.autoHeight;
        if (autoHeight || this.labels === 'separate') {
            this.resize(autoHeight ? this.fullVisibleHeight : this.height, this.labelTop, false);
        }
        else {
            this.toggleExpander(false);
        }
    };
    TrackController.prototype.resize = function (height, arg, saveConfig) {
        height = this.setHeight(height, arg);
        if (typeof arg === 'number') {
            this.view.scaleSettings.imgContainers.children('.gv-labels').css('top', arg);
        }
        this.container.add(this.label).height(height)[height ? 'show' : 'hide']();
        this.toggleExpander();
        if (saveConfig !== false) {
            this.browser.saveConfig();
        }
    };
    TrackController.prototype.toggleExpander = function (saveConfig) {
        if (this.resizable !== true) {
            return;
        }
        var featureMargin = this.view.featureMargin;
        var height = this.height;
        if (this.fullVisibleHeight - featureMargin.top - featureMargin.bottom > height && !this.disabled) {
            this.showMessage('resize');
            var controller_1 = this;
            var h = this.messageContainer.outerHeight(true);
            if (h > height) {
                this.resize(h, undefined, saveConfig);
            }
            this.expander = (this.expander || $('<div class="gv-expander gv-static">').width(this.width).appendTo(this.container).on('click', function () {
                controller_1.resize(controller_1.fullVisibleHeight);
            }))[this.height === 0 ? 'hide' : 'show']();
        }
        else if (this.expander) {
            this.hideMessage('resize');
            this.expander.hide();
        }
    };
    TrackController.prototype.setWidth = function (width) {
        var track = this;
        $.each([this, track.model, track.view], function () {
            this.width = width;
        });
        this.imgContainer.add(this.expander).width(width);
    };
    TrackController.prototype.setScale = function () {
        var controller = this;
        this.scale = this.browser.scale;
        this.resetImageRanges();
        var labels = this.labels;
        if (labels && labels !== 'overlay') {
            this.model.setLabelBuffer(this.browser.labelBuffer);
        }
        if (this.threshold !== Infinity && this.resizable !== 'auto') {
            this.thresholdMessage = this.view.formatLabel(this.threshold);
        }
        $.each(this.view.setScaleSettings(this.scale), function (k, v) {
            controller[k] = v;
        });
        this.hideMessage();
    };
    TrackController.prototype.move = function (delta) {
        var sum = delta.reduce(function (a, b) { return a + b; }, 0);
        this.left += sum;
        this.scrollContainer.css('left', this.left);
        var scrollStart = this.scrollStart;
        if (this.imgRange[scrollStart] && this.imgRange[scrollStart].left + this.left > -this.scrollBuffer * this.width) {
            var end = this.scrollRange[scrollStart].start - 1;
            this.makeImage({
                scale: this.scale,
                chr: this.browser.chr,
                start: end - this.browser.length + 1,
                end: end,
                left: this.imgRange[scrollStart].left,
                cls: scrollStart
            });
            (this.imgRange[scrollStart] || {}).left -= this.width;
            (this.scrollRange[scrollStart] || {}).start -= this.browser.length;
        }
        if (this.imgRange[scrollStart] && this.imgRange[scrollStart].right + this.left < this.scrollBuffer * this.width) {
            var start = this.scrollRange[scrollStart].end + 1;
            this.makeImage({
                scale: this.scale,
                chr: this.browser.chr,
                start: start,
                end: start + this.browser.length - 1,
                left: this.imgRange[scrollStart].right,
                cls: scrollStart
            });
            (this.imgRange[scrollStart] || {}).right += this.width;
            (this.scrollRange[scrollStart] || {}).end += this.browser.length;
        }
    };
    TrackController.prototype.moveTo = function (chr, start, end, delta) {
        var scrollRange = this.scrollRange[this.scrollStart];
        var scrollStart = ['ss', chr, start, end].join('-');
        if (this.scrollRange[scrollStart] || start > scrollRange.end || end < scrollRange.start) {
            this.resetImageRanges();
            this.makeFirstImage(scrollStart);
        }
        else {
            var d = void 0;
            if (typeof delta === 'number') {
                d = [delta];
            }
            else {
                var tmp = (start - this.browser.start) * this.scale;
                d = [tmp];
            }
            this.move(d);
            this.checkHeight();
        }
    };
    TrackController.prototype.makeImage = function (myParams) {
        myParams.scaledStart = myParams.scaledStart || myParams.start * myParams.scale;
        myParams.width = this.width;
        myParams.margin = 1;
        myParams.height = this.height;
        myParams.featureHeight = myParams.featureHeight || 0;
        myParams.labelHeight = myParams.labelHeight || 0;
        var deferred;
        var controller = this;
        var tooLarge = this.browser.length > this.threshold;
        var div = this.imgContainer.clone().addClass((myParams.cls + ' gv-loading').replace('.', '_')).css({ left: myParams.left, display: myParams.cls === this.scrollStart ? 'block' : 'none' });
        var bgImage = myParams.background ? $('<img class="gv-bg">').hide().addClass(myParams.background).prependTo(div) : false;
        var image = $('<img class="gv-data">').hide().appendTo(div).on('load', function () {
            $(this).fadeIn('fast').parent().removeClass('gv-loading');
            $(this).siblings('.gv-bg').show();
        });
        myParams.container = div;
        this.imgContainers.push(div[0]);
        this.scrollContainer.append(this.imgContainers);
        if (!tooLarge && !this.model.checkDataRange(myParams.chr, myParams.start, myParams.end)) {
            var buffer = this.model.dataBuffer;
            myParams.start -= buffer.start;
            myParams.end += buffer.end;
            deferred = this.model.getData(myParams.chr, myParams.start, myParams.end);
        }
        if (!deferred) {
            deferred = $.Deferred();
            setTimeout($.proxy(deferred.resolve, this), 1);
        }
        this.deferreds.push(deferred);
        return deferred.done(function () {
            var features = tooLarge ? [] : controller.model.findFeatures(myParams.chr, myParams.start, myParams.end);
            controller.render(features, image, myParams);
            if (bgImage) {
                controller.renderBackground(features, bgImage, myParams);
            }
        }).fail(function (e) {
            controller.showError(e);
        });
    };
    TrackController.prototype.makeFirstImage = function (moveTo) {
        var deferred = $.Deferred();
        if (this.scrollContainer.children().hide().filter('.' + (moveTo || this.scrollStart)).show().length) {
            this.scrollContainer.css('left', 0);
            this.checkHeight();
            return deferred.resolve();
        }
        var controller = this;
        var chr = this.browser.chr;
        var start = this.browser.start;
        var end = this.browser.end;
        var length = this.browser.length;
        var scale = this.scale;
        var cls = this.scrollStart;
        var images = [{ chr: chr, start: start, end: end, scale: scale, cls: cls, left: 0 }];
        var left = 0;
        var width = this.width;
        if (!this.browser.isStatic) {
            if (start > 1) {
                images.push({ chr: chr, start: start - length, end: start - 1, scale: scale, cls: cls, left: -this.width });
                left = -this.width;
                width += this.width;
            }
            if (end < this.browser.getChromosomeSize(chr)) {
                images.push({ chr: chr, start: end + 1, end: end + length, scale: scale, cls: cls, left: this.width });
                width += this.width;
            }
        }
        var loading = this.imgContainer.clone().addClass('gv-loading').css({ left: left, width: width }).prependTo(this.scrollContainer.css('left', 0));
        var makeImages = function () {
            $.when.apply($, images.map(function (image) {
                return controller.makeImage(image);
            })).done(deferred.resolve);
            loading.remove();
        };
        if (length > this.threshold || this.model.checkDataRange(chr, start, end)) {
            makeImages();
        }
        else {
            var buffer = this.model.dataBuffer;
            this.model.getData(chr, start - buffer.start - length, end + buffer.end + length).done(makeImages).fail(function (e) {
                controller.showError(e);
            });
        }
        return deferred;
    };
    TrackController.prototype.render = function (features, img, params) {
        features = this.view.positionFeatures(this.view.scaleFeatures(features, params.scale), params);
        var featureCanvas = $('<canvas>').attr({ width: params.width, height: params.featureHeight || 1 });
        var labelCanvas = this.labels === 'separate' && params.labelHeight ? featureCanvas.clone().attr('height', params.labelHeight) : featureCanvas;
        var featureContext = featureCanvas[0].getContext('2d');
        var labelContext = labelCanvas[0].getContext('2d');
        featureContext.font = labelContext.font = this.view.font;
        switch (this.labels) {
            case false: break;
            case 'overlay':
                labelContext.textAlign = 'center';
                labelContext.textBaseline = 'middle';
                break;
            default:
                labelContext.textAlign = 'left';
                labelContext.textBaseline = 'top';
                break;
        }
        this.view.draw(features, featureContext, labelContext, params.scale);
        img.attr('src', featureCanvas[0].toDataURL());
        if (labelContext !== featureContext) {
            img.clone(true).attr({ 'class': 'gv-labels', src: labelCanvas[0].toDataURL() }).insertAfter(img);
        }
        this.checkHeight();
        featureCanvas = labelCanvas = img = null;
    };
    TrackController.prototype.renderBackground = function (features, img, params, height) {
        var canvas = $('<canvas>').attr({ width: this.width, height: height || 1 })[0];
        this.view.drawBackground(features, canvas.getContext('2d'), params);
        img.attr('src', canvas.toDataURL());
        canvas = img = null;
    };
    TrackController.prototype.populateMenu = function (feature) {
        var f = $.extend(true, {}, feature);
        var menu = {
            title: f.label ? f.label[0] : f.id,
            Location: f.chr + ':' + f.start + '-' + f.end
        };
        delete f.chr;
        delete f.start;
        delete f.end;
        delete f.sort;
        for (var i in f) {
            if (typeof f[i] === 'object' || menu.title === f[i]) {
                delete f[i];
            }
        }
        return $.extend(menu, f);
    };
    TrackController.prototype.abort = function () {
        for (var i = 0; i < this.deferreds.length; i++) {
            if (this.deferreds[i].state() === 'pending') {
                this.deferreds[i].reject();
            }
        }
        this.deferreds = [];
    };
    TrackController.prototype.destroy = function () {
        this.abort();
        this.container.add(this.label).add(this.menus).remove();
    };
    return TrackController;
}());
exports.default = TrackController;
