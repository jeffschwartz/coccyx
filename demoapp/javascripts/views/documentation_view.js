define(["coccyx", "templates", "common"], function(Coccyx){
    "use strict";

    return {
        name: "documentationView",
        template: Handlebars.templates["documentationpage.tmpl"],
        domTarget: "#content",
        activeMenu: "/documentation",
        render: function(){
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(this.template());
        }
    };
});