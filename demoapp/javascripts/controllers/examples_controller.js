define(["common","coccyx"], function(common, Coccyx) {
    "use strict";

    var showExamplesPage = function(){
        var html = this.$("#examples-page").html(),
            common = Coccyx.userspace.common;
        common.setMenuItemActive("/examples");
        this.$("#content").html(html);
    };

    return {
        name: "examples",
        routes: {
            "get /": showExamplesPage
        }
    };

});
