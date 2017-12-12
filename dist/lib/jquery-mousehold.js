"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
(function ($) {
    $.fn.mousehold = function (timeout, f) {
        if (timeout && typeof timeout == 'function') {
            f = timeout;
            timeout = 100;
        }
        if (f && typeof f == 'function') {
            var timer_1 = 0;
            var fireStep_1 = 0;
            return this.each(function () {
                $(this).mousedown(function () {
                    fireStep_1 = 1;
                    var ctr = 0;
                    var t = this;
                    timer_1 = setInterval(function () {
                        ctr++;
                        f.call(t, ctr);
                        fireStep_1 = 2;
                    }, timeout);
                });
                var clearMousehold = function () {
                    clearInterval(timer_1);
                    if (fireStep_1 == 1)
                        f.call(this, 1);
                    fireStep_1 = 0;
                };
                $(this).mouseout(clearMousehold);
                $(this).mouseup(clearMousehold);
            });
        }
    };
})($);
