

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