define(["coccyx", "templates", "common"], function(Coccyx){
    "use strict";

    return {
        name: "examplesView",
        template: Handlebars.templates["examplespage.tmpl"],
        domTarget: "#content",
        activeMenu: "/examples",
        render: function(){
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(this.template());
        }
    };
});