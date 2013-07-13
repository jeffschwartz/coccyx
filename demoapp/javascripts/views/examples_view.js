define(["coccyx", "handlebars", "templates", "common", "bootstrap"], function(Coccyx, Handlebars){
    "use strict";

    return {
        name: "examples",
        template: Handlebars.templates["examples.tmpl"],
        domTarget: "#content",
        activeMenu: "/examples",
        render: function(){
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(this.template());
        }
    };
});