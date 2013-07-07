define(["coccyx"], function (cx) {
    "use strict";

    var showExamplesPage = function(){
        var common = cx.userspace.common;
        common.setMenuItemActive("/examples");
        this.$("#content").html("");
    };

    cx.controllers.registerController({
        name: "examples",
        routes: {
            "/": showExamplesPage
        }
    });

});
