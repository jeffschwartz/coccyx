define(["coccyx", "templates", "common", "bootstrap"], function(Coccyx){
    "use strict";

    return {
        name: "contactView",
        template: Handlebars.templates["contactpage.tmpl"],
        domTarget: "#content",
        activeMenu: "/contact",
        render: function(){
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(this.template());
        }
    };
});