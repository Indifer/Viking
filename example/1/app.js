
var app = {};
app.start = function () {
    //#region

    var opt = {
        baseUrl: './',
        paths: {
            'text': '../../dev/libs/text',
            'jquery': '../../dev/libs/jquery-3.2.1.min',
            'ejs': '../../dev/libs/ejs',
            'signals': '../../dev/libs/signals',
            'crossroads': '../../dev/libs/crossroads',
            'viking': '../../dev/src/core',
            'viking/util':'../../dev/src/util',
            'viking/history':'../../dev/src/history',
            'viking/view':'../../dev/src/view',
            'viking/app':'../../dev/src/app',
        }
    };
    if (window._DEBUG) {
        opt.urlArgs = "bust=" + (new Date()).getTime();
    }
    require.config(opt);

    require(['viking', 'viking/app', 'jquery', 'ejs'], function (viking) {

        window.viking = viking;
        viking.app.ready();
        viking.app.goto("#main/page_one");
    });



};

app.start();