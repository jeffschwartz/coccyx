define(["common","coccyx"], function(common, Coccyx) {
    "use strict";

    var showExamplesPage = function(){
        var html = this.$("#examples-page").html(),
            common = Coccyx.userspace.common;
        common.setMenuItemActive("/examples");
        console.log(html);
        this.$("#content").html(html);
    };

    return {
        name: "examples",
        routes: {
            "/": showExamplesPage
        }
    };

});
