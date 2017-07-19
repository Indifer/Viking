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