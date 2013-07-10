define(["coccyx", "templates", "common"], function(Coccyx){
    "use strict";

    return {
        name: "indexView",
        template: Handlebars.templates["indexpage.tmpl"],
        domTarget: "#content",
        activeMenu: "/",
        render: function(){
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(this.template());
        }
    };
});