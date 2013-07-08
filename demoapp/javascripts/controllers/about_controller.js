define(["common","coccyx"], function(common, Coccyx){
    "use strict";

    var showAboutPage = function(){
        // Render the index page which is purely static, no dynamic
        // content at all, so no need to use any kind of templating.
        var html = this.$("#about-page").html(),
            common = Coccyx.userspace.common;
        common.setMenuItemActive("/about");
        this.$("#content").html(html);
    };

    return {
        name: "about",
        routes: {
            "get /": showAboutPage
        }
    };

});