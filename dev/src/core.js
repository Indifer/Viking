
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

        // routeName = routeName.indexOf("#") > -1 ? routeName.substr(1) : routeName;
        // return routeName.replace(/\//g, '-');
        return routeName.indexOf("#") > -1 ? routeName.substr(1) : routeName;
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

    //
    Viking.prototype.getRouteNameByRoute = function (route) {

        route = this.formatRoute(route);
        for (var n in this.controllers) {

            if (this.controllers[n].match(route)) {
                return this.formatRouteName(n)
            }
        }
        return "";
    };

    //
    Viking.prototype.getRouteByParameter = function (routeName, parameter) {

        var route = this.controllers[routeName];
        if (!route) return "";

        return route.interpolate(parameter);
    };

    //
    Viking.prototype.onRouteChange = function (reset) {
        reset = reset || false;
        if (reset) {
            crossroads.resetState();
        }

        var n = this.currentRoute.indexOf("#") > -1 ? this.currentRoute.substr(1) : this.currentRoute;
        crossroads.parse(n);
    };

    //
    Viking.prototype.gotoRoute = function (toRoute, reset) {
        this.routeType = 'action';
        this.lastRoute = this.currentRoute;
        this.lastRouteName = this.currentRouteName;

        var n = toRoute.toLowerCase();
        this.currentRoute = n;

        this.onRouteChange(reset);
    };

    //
    Viking.prototype.gotoRouteBefore = function (toRoute) {

        this.routeType = 'beforeAction';
        var n = toRoute.toLowerCase();
        n = n.indexOf("#") > -1 ? n.substr(1) : n;
        crossroads.parse(n);
        crossroads.resetState();
    };

    //
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