"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
(function ($) {
    var Tipsy = (function () {
        function Tipsy(element, options) {
            this.$element = $(element);
            this.options = options;
            this.enabled = true;
            this.fixTitle();
        }
        Tipsy.maybeCall = function (thing, ctx) {
            return (typeof thing === 'function') ? (thing.call(ctx)) : thing;
        };
        ;
        Tipsy.isElementInDOM = function (ele) {
            while (ele = ele.parentNode) {
                if (ele === document)
                    return true;
            }
            return false;
        };
        ;
        Tipsy.prototype.fixTitle = function () {
            var $e = this.$element;
            if ($e.attr('title') || typeof ($e.attr('original-title')) != 'string') {
                $e.attr('original-title', $e.attr('title') || '').removeAttr('title');
            }
        };
        Tipsy.prototype.show = function () {
            var title = this.getTitle();
            if (title && this.enabled) {
                var $tip = this.tip();
                var meth = this.options.html ? 'html' : 'text';
                switch (meth) {
                    case 'html':
                        $tip.find('.tipsy-inner').html(title);
                    case 'text':
                        $tip.find('.tipsy-inner').text(title);
                    default:
                        break;
                }
                $tip[0].className = 'tipsy';
                $tip.remove().css({ top: 0, left: 0, visibility: 'hidden', display: 'block' }).prependTo(document.body);
                var pos = $.extend({}, this.$element.offset(), {
                    width: this.$element[0].offsetWidth,
                    height: this.$element[0].offsetHeight
                });
                var actualWidth = $tip[0].offsetWidth, actualHeight = $tip[0].offsetHeight, gravity = Tipsy.maybeCall(this.options.gravity, this.$element[0]);
                var tp = void 0;
                switch (gravity.charAt(0)) {
                    case 'n':
                        tp = { top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2 };
                        break;
                    case 's':
                        tp = { top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2 };
                        break;
                    case 'e':
                        tp = { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset };
                        break;
                    case 'w':
                        tp = { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset };
                        break;
                }
                if (gravity.length == 2) {
                    if (gravity.charAt(1) == 'w') {
                        tp.left = pos.left + pos.width / 2 - 15;
                    }
                    else {
                        tp.left = pos.left + pos.width / 2 - actualWidth + 15;
                    }
                }
                $tip.css(tp).addClass('tipsy-' + gravity);
                $tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);
                if (this.options.className) {
                    $tip.addClass(Tipsy.maybeCall(this.options.className, this.$element[0]));
                }
                if (this.options.fade) {
                    $tip.stop().css({ opacity: 0, display: 'block', visibility: 'visible' }).animate({ opacity: this.options.opacity });
                }
                else {
                    $tip.css({ visibility: 'visible', opacity: this.options.opacity });
                }
            }
        };
        Tipsy.prototype.hide = function () {
            if (this.options.fade) {
                this.tip().stop().fadeOut(function () { $(this).remove(); });
            }
            else {
                this.tip().remove();
            }
        };
        Tipsy.prototype.getTitle = function () {
            var $e = this.$element;
            this.fixTitle();
            var title, o = this.options;
            if (typeof o.title == 'string') {
                title = $e.attr(o.title == 'title' ? 'original-title' : o.title);
            }
            else if (typeof o.title == 'function') {
                title = o.title.call($e[0]);
            }
            title = ('' + title).replace(/(^\s*|\s*$)/, "");
            return title || o.fallback;
        };
        Tipsy.prototype.tip = function () {
            if (!this.$tip) {
                this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');
                this.$tip.data('tipsy-pointee', this.$element[0]);
            }
            return this.$tip;
        };
        Tipsy.prototype.validate = function () {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.$element = null;
                this.options = null;
            }
        };
        Tipsy.prototype.enable = function () { this.enabled = true; };
        Tipsy.prototype.disable = function () { this.enabled = false; };
        Tipsy.prototype.toggleEnabled = function () { this.enabled = !this.enabled; };
        return Tipsy;
    }());
    $.fn.tipsy = function (options) {
        if (options === true) {
            return this.data('tipsy');
        }
        else if (typeof options === 'string') {
            var tipsy = this.data('tipsy');
            if (tipsy)
                tipsy[options]();
            return this;
        }
        options = $.extend({}, $.fn.tipsyDefaults, options);
        function get(ele) {
            var tipsy = $.data(ele, 'tipsy');
            if (!tipsy) {
                tipsy = new Tipsy(ele, $.fn.tipsyElementOptions(ele, options));
                $.data(ele, 'tipsy', tipsy);
            }
            return tipsy;
        }
        function enter() {
            var tipsy = get(this);
            tipsy.hoverState = 'in';
            if (options.delayIn == 0) {
                tipsy.show();
            }
            else {
                tipsy.fixTitle();
                setTimeout(function () { if (tipsy.hoverState == 'in')
                    tipsy.show(); }, options.delayIn);
            }
        }
        ;
        function leave() {
            var tipsy = get(this);
            tipsy.hoverState = 'out';
            if (options.delayOut == 0) {
                tipsy.hide();
            }
            else {
                setTimeout(function () { if (tipsy.hoverState == 'out')
                    tipsy.hide(); }, options.delayOut);
            }
        }
        ;
        if (!options.live)
            this.each(function () { get(this); });
        if (options.trigger != 'manual') {
            var binder = options.live ? 'live' : 'bind', eventIn = options.trigger == 'hover' ? 'mouseenter' : 'focus', eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur';
            this[binder](eventIn, enter)[binder](eventOut, leave);
        }
        return this;
    };
    $.fn.tipsyDefaults = {
        className: null,
        delayIn: 0,
        delayOut: 0,
        fade: false,
        fallback: '',
        gravity: 'n',
        html: false,
        live: false,
        offset: 0,
        opacity: 0.8,
        title: 'title',
        trigger: 'hover'
    };
    $.fn.tipsyRevalidate = function () {
        $('.tipsy').each(function () {
            var pointee = $.data(this, 'tipsy-pointee');
            if (!pointee || !Tipsy.isElementInDOM(pointee)) {
                $(this).remove();
            }
        });
    };
    $.fn.tipsyElementOptions = function (ele, options) {
        return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
    };
    $.fn.tipsyAutoNS = function () {
        return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
    };
    $.fn.tipsyAutoWE = function () {
        return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
    };
    $.fn.tipsyAutoBounds = function (margin, prefer) {
        return function () {
            var dir = { ns: prefer[0], ew: (prefer.length > 1 ? prefer[1] : null) }, boundTop = $(document).scrollTop() + margin, boundLeft = $(document).scrollLeft() + margin, $this = $(this);
            if ($this.offset().top < boundTop)
                dir.ns = 'n';
            if ($this.offset().left < boundLeft)
                dir.ew = 'w';
            if ($(window).width() + $(document).scrollLeft() - $this.offset().left < margin)
                dir.ew = 'e';
            if ($(window).height() + $(document).scrollTop() - $this.offset().top < margin)
                dir.ns = 's';
            return dir.ns + (dir.ew ? dir.ew : '');
        };
    };
})($);
