define(["coccyx", "templates", "common", "bootstrap"], function(Coccyx){
    "use strict";

    return {
        name: "aboutView",
        template: Handlebars.templates["aboutpage.tmpl"],
        domTarget: "#content",
        activeMenu: "/about",
        render: function(){
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(this.template());
        }
    };
});