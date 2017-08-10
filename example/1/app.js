
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
            'viking/util': '../../dev/src/util',
            'viking/history': '../../dev/src/history',
            'viking/view': '../../dev/src/view',
            'viking/app': '../../dev/src/app',
        }
    };
    opt.urlArgs = "v=0.112";
    require.config(opt);

    require(['viking', 'viking/app', 'jquery', 'ejs'], function (viking) {

        window.viking = viking;
        viking.app.ready();
        viking.app.homeRoute = "#main/page_one";
        var hash = window.location.hash || viking.app.homeRoute;
        viking.app.goto(hash);
    });



};

app.start();