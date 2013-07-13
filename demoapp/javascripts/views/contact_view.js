define(["coccyx", "handlebars", "templates", "common", "bootstrap"], function(Coccyx, Handlebars){
    "use strict";

    return {
        name: "contact",
        template: Handlebars.templates["contact.tmpl"],
        domTarget: "#content",
        activeMenu: "/contact",
        render: function(){
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(this.template());
        }
    };
});