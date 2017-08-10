; define(['viking', 'text!view/main/page_one.ejs?v=1'], function (viking, temp) {

    var module = {
        name: 'main/page_one'
    };
    viking.view.define(module.name, temp, {});

    //page one route
    viking.defineController(module.name, {
        route: "main/page_one",
        rules: {},
        action: function () {

        },
        init: function () {

        }
    });

    return module;
});