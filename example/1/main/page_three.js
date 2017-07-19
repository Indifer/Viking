; define(['viking', 'text!view/main/page_three.ejs'], function (viking, temp) {

    var module = {
        name: 'main/page_three'
    };
    viking.view.define(module.name, temp, {});

    //page two route
    viking.defineController(module.name, {
        route: "main/page_three",
        rules: {},
        action: function () {

        },
        init: function () {

        },
        module: module
    });

    return module;

});