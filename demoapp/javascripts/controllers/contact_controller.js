define(["common","coccyx"], function(common, Coccyx){
    "use strict";

    var showContactPage = function(){
        // Render the index page which is purely static, no dynamic
        // content at all, so no need to use any kind of templating.
        var html = this.$("#contact-page").html(),
            common = Coccyx.userspace.common;
        common.setMenuItemActive("/contact");
        this.$("#content").html(html);
    };

    return {
        name: "contact",
        routes: {
            "/": showContactPage
        }
    };

});