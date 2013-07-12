define(["coccyx", "templates", "common", "bootstrap"], function(Coccyx){
    "use strict";

    return {
        name: "apirefference",
        template: Handlebars.templates["apirefference.tmpl"],
        domTarget: "#content",
        activeMenu: "/documentation",
        render: function(){
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(this.template());
        }
    };
});
