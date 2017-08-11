; (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('viking'), require('viking/util'), require('viking/history'), require('viking/view')) :
        typeof define === 'function' && define.amd ? define('viking/app', ['viking', 'viking/util', 'viking/history', 'viking/view'], factory) :
            (factory(global['viking'], global['viking.util'], global['viking.history'], global['viking.view']));
}(this, (function (viking, util, history, view) {

    'use strict';

    //#region viking.app

    viking.fn.app = {};

    //viking.app.views = {};
    viking.app.transitionsFlag = 0;
    //viking.app.isIos = null;
    //viking.app.isAndroid = null;
    window.addEventListener("popstate", function () {

        var toRoute = (window.history.state && window.history.state.toRoute);
        if (toRoute) {

            var toRouteName = viking.getRouteNameByRoute(toRoute);
            if (util.isNullOrEmpty(toRouteName)) {
                setTimeout(function () {
                    viking.app.goto(toRoute);
                }, 1)
                return;
            }

            var routeName = viking.formatRouteToRouteName(toRoute);
            var popIndex = history.popTo(routeName);

            pageTurn(toRoute, popIndex > 0, false);
        }

        toRoute = window.location.hash;
        if (toRoute) {
            viking.app.goto(toRoute);
        }

    });


    /**
     * 页面跳转
     * @param {String} toRoute 跳转route
     * @param {String} back 页面后退模式
     * @param {String} reset 页面跳转前，调用controller的reset
     * @param {String} transition 暂时废弃
     * @param {String} transitionsCallback 暂时废弃
     */
    function pageTurn(toRoute, back, reset, transition, transitionsCallback) {

        var _this = viking.app;

        var toRouteName = viking.getRouteNameByRoute(toRoute);
        var fromRouteName = viking.currentRouteName;

        //page init
        _this.initPage(toRouteName);
        //controller init
        if (!viking.controllers[toRouteName].isInit) {
            viking.controllers[toRouteName].isInit = true;
            typeof viking.controllers[toRouteName].init === "function" && typeof viking.controllers[toRouteName].init();

        }

        // events
        if (_this.events["onBeforeGoto"]) {
            var actions = _this.events["onBeforeGoto"];
            for (var i = 0; i < actions.length; i++) {
                actions[i](fromRouteName, toRouteName);
            }
        }
        // reset
        if (reset && typeof viking.controllers[toRouteName].reset === "function") {

            viking.controllers[toRouteName].reset();
        }
        // 动画执行完的回调
        var callbackFunc = function () {
            if (fromRouteName !== "") {
                if (typeof viking.controllers[fromRouteName].destroy === "function") {
                    viking.controllers[fromRouteName].destroy();
                    viking.controllers[fromRouteName].isInit = false;
                }
            }

            viking.gotoRoute(toRoute.trim());

            _this.transitionsFlag = 0;

            if (typeof transitionsCallback === "function") {
                transitionsCallback();
            }
        };

        if (viking.controllers[toRouteName].existBeforeAction) {
            viking.gotoRouteBefore(toRoute.trim());
        }

        _this.transitionsFlag = 2;
        _this.transitions(transition, toRouteName, fromRouteName, null, callbackFunc);

    }

    var events = {};

    viking.extend(viking.fn.app, {
        events: {},
        addEvent: function (name, callback) {
            this.events[name] = this.events[name] || [];
            this.events[name].push(callback);
        },
        beforeGoto: null,
        transitions: function (transition, show, hide, speed, transitionsCallback) {

            //var browserVariables = mad.browserVariables;

            show = show;
            hide = !util.isNullOrEmpty(hide) ? hide : null;
            var w = $(window).width();
            var h = $(window).height();
            speed = speed || 300;
            //s = speed / 1000.0 + "s";
            //var translate3d;
            //var easing = "ease-out";

            switch (transition) {
                case "slideLeft":
                case "slideRight":
                //#region fade

                case "fade":

                //#endregion

                //#region none

                case "none"://不执行任何动画
                default:
                    if (hide) {
                        $(document.getElementById(hide)).css({
                            "left": 0,
                            "top": 0,
                            "opacity": 1
                        });
                    }

                    $(document.getElementById(show)).css({
                        "left": 0,
                        "top": 0,
                        "opacity": 1
                    });

                    var _option = {};
                    //for (var i in browserVariables.cssPrefixes) {
                    //    var transform = browserVariables.cssPrefixes[i] + "transform";
                    //    var transition_duration = browserVariables.cssPrefixes[i] + "transition-duration";
                    //    _option[transform] = "translate3d(0px,0px,0px)";
                    //    _option[transition_duration] = "0s";
                    //}

                    $(document.getElementById(show)).css(_option);
                    if (hide) {
                        $(document.getElementById(hide)).css(_option);
                        $(document.getElementById(hide)).hide();
                    }
                    $(document.getElementById(show)).show();

                    //_option["left"] = 0;
                    //_option["top"] = 0;
                    //_option["width"] = "100%";
                    //_option["height"] = "100%";

                    //windowResize();

                    if (typeof transitionsCallback == "function") {
                        transitionsCallback();
                    }

                    break;
                //#endregion
            }

        },

        /**
         * 页面后退（一步）
         * @param {String} reset 页面跳转前，调用controller的reset
         * @param {String} transition 暂时废弃
         * @param {String} transitionsCallback 暂时废弃
         */
        back: function (reset, transition, transitionsCallback) {
            var _this = this;
            var toRoute = history.last();
            if (util.isNullOrEmpty(toRoute)) {
                _this.homeRoute && _this.goto(_this.homeRoute);
            }
            else {
                // var popArray = history.pop();
                _this.goto(toRoute, true, reset, transition);
            }

        },

        /**
         * 页面跳转
         * @param {String} toRoute 跳转route
         * @param {String} back 页面后退模式
         * @param {String} reset 页面跳转前，调用controller的reset
         * @param {String} transition 暂时废弃
         * @param {String} transitionsCallback 暂时废弃
         * @param {Boolean} tryAmded 尝试Amd加载过
         */
        goto: function (toRoute, back, reset, transition, transitionsCallback, tryAmded) {
            var _this = this;
            tryAmded = tryAmded || false;

            if (util.isNullOrEmpty(toRoute) || _this.transitionsFlag != 0) {
                return;
            }

            //var toRoute = toRoute;
            var toRouteName = viking.getRouteNameByRoute(toRoute);

            if (toRouteName == "") {
                _this.transitionsFlag = 0;
                if (!tryAmded && !util.isNullOrEmpty(toRoute)) {

                    var _source;
                    var _i = toRoute.indexOf('#');
                    if (_i > -1) {

                        _source = toRoute.substr(_i + 1);
                    }
                    else {
                        _source = toRoute;
                    }

                    _i = _source.indexOf('?');
                    if (_i > -1) {

                        _source = _source.substr(0, _i);
                    }

                    require([(viking.app.baseFolder || "") + _source], function (_) {
                        _this.goto(toRoute, back, reset, transition, transitionsCallback, true);
                    });
                }

                return;
            }

            if ($(document.getElementById(toRouteName)).css("display") === "block") {
                _this.transitionsFlag = 0;
                return;
            }

            reset = reset != null && reset.toString() === "true" ? true : false;
            back = back != null && back.toString() === "true" ? true : false;
            //history
            if (!back) {

                var state = { toRoute: toRoute };
                if (viking.currentRoute) {
                    history.add(viking.currentRoute);
                    window.history.pushState(state, "", toRoute);
                }
                else {

                    window.history.replaceState(state, "", toRoute);

                }
            }
            if (back) {
                var popIndex = history.index(toRouteName);
                if (popIndex >= 0) {
                    window.history.go(-popIndex);
                    return;
                }
            }

            pageTurn(toRoute, back, reset, transition, transitionsCallback);

        },
        //初始化page
        initPage: function (id) {
            var _this = this;

            var page = $(document.getElementById(id));
            if (page.length == 0 && view && view.getPage) {

                if (_this.showLoading) {
                    _this.showLoading();
                }

                page = view.getPage(id);
                page = $(page);
                page.attr("id", id);
                page.attr("vk-role", "page");
                page.addClass("page");
                page.css("display", "none");

                var container = $("#vk-container");
                container.append(page);

                if (_this.hideLoading) {
                    _this.hideLoading();
                }
            }
        },
        initApp: function () {

            var outer = $("#vk-outer");
            if (outer.length === 0) {

                var $div = $("div");
                $div.attr("id", "vk-outer");
                var $container = $("div");
                $container.attr("id", "vk-container");
                $container.addClass("clearfixed");
                $div.append($container);

                $("body").children().remove();
                $("body").append($div);
            }
        },
        ready: function (options) {

            var _this = this;
            //if (typeof options == "object") {
            //    mad.app.isIos = options.isIos;
            //    mad.app.isAndroid = options.isAndroid;
            //}

            //mad.app.isIos = mad.app.isIos || /iPhone|iPad|iPod|iOS/i.test(global.navigator.userAgent);
            //mad.app.isAndroid = mad.app.isAndroid || /Android/i.test(global.navigator.userAgent);

            //document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

            //
            //if (mad.app.isIos) {
            //    window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", orientationChange, false);
            //}
            //else {
            //    $(window).resize(function () {
            //        windowResizeFunc();
            //    });
            //}

            //_this.width = $(window).width();
            //_this.height = $(window).height();

            _this.initApp();

            //$("#mad-outer").css("height", this.height);

            ////page
            //$("[vk-role]").each(function () {

            //    var role = $(this).attr("vk-role");
            //    if (!viking_util.isNullOrEmpty(role) && /(page)|(modal)/.test(role)) {

            //        $(this).css({ "width": _this.width + "px", "height": _this.height + "px", "display": "none" });
            //        $(this).addClass(role);
            //        _this.views[$(this).attr("id")] = { role: role };

            //        $(this).find("[vk-role='scrollerSection']").addClass("scrollerSection");

            //        if (_this.statusbar) {
            //            $(this).prepend('<div class="statusbar"></div>');
            //        }
            //    }
            //});

            //route btn
            $("#vk-outer").on("click", "[vk-goto]", function () {

                var goto = $(this).attr("vk-goto");
                var transition = $(this).attr("vk-transition");
                var reset = $(this).attr("vk-reset");
                var back = $(this).attr("vk-back");

                back = back != null && back.toString() === "true" ? true : false;
                if (!util.isNullOrEmpty(goto)) {
                    _this.goto(goto, back, reset, transition);
                }
                else if (back) {
                    _this.back(reset, transition);
                }

                return false;
            });
        }

    });

    //#endregion

    return viking.app;

})));
