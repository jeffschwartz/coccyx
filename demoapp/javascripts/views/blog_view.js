define(["coccyx", "handlebars", "templates", "common", "bootstrap"], function(Coccyx, Handlebars){
    "use strict";

    return {
        name: "blog",
        template: Handlebars.templates["blog.tmpl"],
        domTarget: "#content",
        activeMenu: "/blog",
        render: function(){
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(this.template());
        }
    };
});