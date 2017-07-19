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