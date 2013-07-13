define(["coccyx", "handlebars", "templates", "common", "bootstrap"], function(Coccyx, Handlebars){
    "use strict";

    return {
        name: "quickstartguide",
        template: Handlebars.templates["quickstartguide.tmpl"],
        domTarget: "#content",
        activeMenu: "/documentation",
        render: function(){
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(this.template());
        }
    };
});