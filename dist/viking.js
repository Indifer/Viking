﻿/** @license
 * viking <>
 * Author: indifer | MIT License
 * Email: indifer@126.com|liangyi_z@126.com
 * v0.2.0 (2017/07/20 19:37)
 */



; (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('crossroads')) :
        typeof define === 'function' && define.amd ? define('viking', ['crossroads'], factory) :
            (global.viking = factory(global['crossroads']));
}(this, (function (crossroads) {

    'use strict';

    //#region core

    function Viking() {

        this.crossroads = crossroads;

        this.currentRouteName = "";
        this.currentRoute = "";
        this.currentRefresh = false;

        this.lastRoute = "";
        this.lastRouteName = "";

        //0:action; 1:beforeAction
        this.routeType = 'action';

        this.controllers = {};

        this.crossroads.bypassed.add(function (request) {
            console.log(request);
        });

        return this;
    }


    /*
     * define controller
     */
    Viking.prototype.defineController = function (routeName, options) {

        routeName = this.formatRouteName(routeName);
        var _this = this;
        options = options || {};

        var action = options.action;
        var beforeAction = options.beforeAction;
        var _route = this.crossroads.addRoute(options.route, function () {

            if (_this.routeType === 'action') {
                var _r = routeName;
                _this.currentRouteName = _r;
                action.apply(options.action, arguments);
            }
            else if (_this.routeType === 'beforeAction' && typeof (beforeAction) === "function") {

                beforeAction.apply(options.beforeAction, arguments);
            }

        });

        if (options.rules) {
            _route.rules = options.rules;
        }
        _route.existBeforeAction = typeof (options.beforeAction) === "function";
        _route.reset = options.reset;
        _route.resize = options.resize;
        _route.destroy = options.destroy;
        _route.init = options.init;
        _route.module = options.module;

        this.controllers[routeName] = _route;

        // if (typeof options.init === "function") {
        //     options.init();
        // }

    };
    //
    Viking.prototype.formatRouteName = function (routeName) {

        routeName = routeName.indexOf("#") > -1 ? routeName.substr(1) : routeName;
        return routeName.replace(/\//g, '-');
    };

    //
    Viking.prototype.formatRoute = function (route) {

        return route.indexOf("#") > -1 ? route.substr(1) : route;
    };

    //
    Viking.prototype.formatRouteToRouteName = function (route) {

        var flag1 = route.indexOf("#"), flag2 = route.indexOf("?");
        route = route.substring(flag1 > -1 ? flag1 + 1 : 0, flag2 > -1 ? flag2 : route.length);
        return route;
    };

    Viking.prototype.getRouteNameByRoute = function (route) {

        route = this.formatRouteToRouteName(route);
        for (var n in this.controllers) {

            if (this.controllers[n].match(route)) {
                return this.formatRouteName(n)
            }
        }
        return "";
    };

    Viking.prototype.getRouteByParameter = function (routeName, parameter) {

        var route = this.controllers[routeName];
        if (!route) return "";

        return route.interpolate(parameter);
    };

    Viking.prototype.onRouteChange = function (reset) {
        reset = reset || false;
        if (reset) {
            crossroads.resetState();
        }

        var n = this.currentRoute.indexOf("#") > -1 ? this.currentRoute.substr(1) : this.currentRoute;
        crossroads.parse(n);
    };

    Viking.prototype.gotoRoute = function (toRoute, reset) {
        this.routeType = 'action';
        this.lastRoute = this.currentRoute;
        this.lastRouteName = this.currentRouteName;

        var n = toRoute.toLowerCase();
        this.currentRoute = n;

        this.onRouteChange(reset);
    };

    Viking.prototype.gotoRouteBefore = function (toRoute) {

        this.routeType = 'beforeAction';
        var n = toRoute.toLowerCase();
        n = n.indexOf("#") > -1 ? n.substr(1) : n;
        crossroads.parse(n);
        crossroads.resetState();
    };

    Viking.prototype.extend = function (target, src) {
        for (var key in src) {
            if (src.hasOwnProperty(key)) {
                target[key] = src[key];
            }
        }
    };


    //#endregion

    var viking = new Viking();
    viking.fn = Viking.prototype;

    return viking;

})));


;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('viking')) :
        typeof define === 'function' && define.amd ? define('viking/util', ['viking'], factory) :
            (factory(global['viking']));
}(this, (function (viking) {

    'use strict';

    //#region viking.util

    var util = {

        //判断是否为空字符或null
        isNullOrEmpty: function (value) {

            if (value === null || value === undefined || String.prototype.trim.call(value) === "") {
                return true;
            }
            else {
                return false;
            }
        },
        //解析url参数
        decodeUrlParams: function (val) {
            val = val.split("&");
            var _temp;

            var data = {};
            for (var i in val) {
                if (!val.hasOwnProperty(i)) {
                    continue;
                }
                _temp = val[i].split("=");
                if (_temp.length === 2) {
                    data[_temp[0]] = _temp[1];
                }
            }

            return data;
        }
    };

    viking.util = util;

    //#endregion


    return viking.util;

})));
;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('viking'), require('viking/util')) :
        typeof define === 'function' && define.amd ? define('viking/history', ['viking', 'viking/util'], factory) :
            (factory(global['viking'], global['viking.util']));
}(this, (function (viking, util) {

    'use strict';
    //#region appHistory

    //app页面历史
    function AppHistory() {

        this._values = [];
        return this;
    }

    //
    AppHistory.prototype.clear = function () {
        this._values = [];
    };


    //总数
    AppHistory.prototype.count = function () {
        return this._values.length;
    };

    //
    AppHistory.prototype.last = function () {
        if (this._values.length > 0) {
            return this._values[this._values.length - 1];
        }
        return null;
    };

    AppHistory.prototype.pop = function (count) {

        var result = [];
        count = count || 1;
        while (count > 0) {

            if (this._values.length > 0) {
                result.push(this._values.pop());
            }
            count--;
        }
        return result;
    };

    //添加
    AppHistory.prototype.add = function (val) {
        if (util.isNullOrEmpty(val)) return false;
        val = val.toString().toLowerCase().trim();

        if (this._values.length === 0 || this._values[this._values.length - 1] != val) {
            this._values.push(val);
            return true;
        }
        return false;
    };

    //更新
    AppHistory.prototype.update = function (val, index) {
        if (util.isNullOrEmpty(val) || index < 0) return false;
        val = val.toString().toLowerCase().trim();

        if (this._values.length > index) {
            this._values[index] = val;
            return true;
        }
        return false;
    };

    //
    AppHistory.prototype.item = function (index) {

        if (index < 0 || index > this._values.length - 1) return null;
        return this._values[index];
    };

    //
    AppHistory.prototype.popTo = function (name) {

        if (util.isNullOrEmpty(name)) return;

        var count = this.count();
        if (count > 0) {

            for (var i = count - 1; i >= 0; i--) {

                if (this.item(i).indexOf(name.toLowerCase()) > -1) {
                    var popCount = count - i;
                    this.pop(popCount);
                    return popCount;
                }
            }
        }

        return 0
    };
    
    //
    AppHistory.prototype.index = function (name) {

        if (util.isNullOrEmpty(name)) return;

        var count = this.count();
        if (count > 0) {

            for (var i = count - 1; i >= 0; i--) {

                if (this.item(i).indexOf(name.toLowerCase()) > -1) {
                    var popCount = count - i;
                    return popCount;
                }
            }
        }

        return 0
    };

    viking.history = new AppHistory();

    //#endregion


    return viking.history;
    

})));
;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('viking'), require('ejs')) :
        typeof define === 'function' && define.amd ? define('viking/view', ['viking', 'ejs'], factory) :
            (factory(global['viking'], global['ejs']));
}(this, (function (viking, ejs) {

    'use strict';
    
    //#region viking.view

    viking.fn.view = {};

    viking.view.tempCached = true;
    viking.view.templates = {};
    viking.view.pages = {};

    viking.extend(viking.fn.view, {

        //声明 view
        define: function (pageName, template, data) {
            pageName = viking.formatRouteName(pageName);
            this.pages[pageName] = {
                template: template,
                data: data
            };
        },
        getPage: function (pageName) {

            var page = this.pages[pageName];

            if (page) {
                return this.render({
                    cache: false,
                    name: pageName
                }, page.data);
            }
            return null;
        },
        render: function (options, data) {

            var _temp;
            if (typeof options === "string") {
                _temp = options;
            }
            else if (options.name) {
                _temp = this.pages[options.name].template;
            }

            var html = ejs.render(_temp, data);
            return html;
        }

    });

    //#endregion
    return viking.view;
    
})));
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
                    viking.controllers[toRouteName].isInit = false;
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

            show = "#" + show;
            hide = !util.isNullOrEmpty(hide) ? "#" + hide : null;
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
                        $(hide).css({
                            "left": 0,
                            "top": 0,
                            "opacity": 1
                        });
                    }

                    $(show).css({
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

                    $(show).css(_option);
                    if (hide) {
                        $(hide).css(_option);
                        $(hide).hide();
                    }
                    $(show).show();

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
        back: function (reset, transition) {
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

                    var _toRoute;
                    var _i = toRoute.indexOf('#');
                    if (_i > -1) {

                        _toRoute = toRoute.substr(_i + 1);
                    }
                    else {
                        _toRoute = toRoute;
                    }

                    _i = _toRoute.indexOf('?');
                    if (_i > -1) {

                        _toRoute = _toRoute.substr(0, _i);
                    }

                    require([(viking.app.baseFolder || "") + _toRoute], function (_) {
                        _this.goto(toRoute, back, reset, transition, transitionsCallback, true);
                    });
                }

                return;
            }

            if ($("#" + toRouteName).css("display") === "block") {
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
                    window.history.go(-popIndex - 1);
                    return;
                }
            }

            pageTurn(toRoute, back, reset, transition, transitionsCallback);

        },
        //初始化page
        initPage: function (id) {
            var _this = this;

            var page = $("#" + id);
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




