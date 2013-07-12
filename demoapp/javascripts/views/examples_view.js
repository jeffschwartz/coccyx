define(["coccyx", "templates", "common", "bootstrap"], function(Coccyx){
    "use strict";

    return {
        name: "examples",
        template: Handlebars.templates["examplespage.tmpl"],
        domTarget: "#content",
        activeMenu: "/examples",
        render: function(){
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(this.template());
        }
    };
});