define(["coccyx", "templates", "common", "bootstrap"], function(Coccyx){
    "use strict";

    return {
        name: "blogView",
        template: Handlebars.templates["blogpage.tmpl"],
        domTarget: "#content",
        activeMenu: "/blog",
        render: function(){
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(this.template());
        }
    };
});