define(["common","coccyx"], function(common, Coccyx){
    "use strict";

    var showDocumentationPage = function(){
        // Render the index page which is purely static, no dynamic
        // content at all, so no need to use any kind of templating.
        var html = this.$("#documentation-page").html(),
            common = Coccyx.userspace.common;
        common.setMenuItemActive("/documentation");
        this.$("#content").html(html);
    };

    return {
        name: "documentation",
        routes: {
            "get /": showDocumentationPage
        }
    };

});