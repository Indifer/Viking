; define(['viking', 'text!view/main/page_two.ejs'], function (viking, temp) {

    var module = {
        name: 'main/page_two'
    };
    viking.view.define(module.name, temp, {});

    //page two route
    viking.defineController(module.name, {
        route: "main/page_two:?a:",
        rules: {},
        action: function (a) {
            console.log("a:" + JSON.stringify(a));

        },
        init: function () {

        },
        module: module
    });

    return module;

});