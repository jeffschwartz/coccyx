define(["coccyx", "templates", "common", "bootstrap"], function(Coccyx){
    "use strict";

    return {
        name: "index",
        template: Handlebars.templates["indexpage.tmpl"],
        domTarget: "#content",
        activeMenu: "/",
        render: function(){
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(this.template());
        }
    };
});