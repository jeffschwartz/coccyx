define(["coccyx", "common"], function(Coccyx){
    "use strict";

    return {
        name: "contactView",
        template: "#contact-page",
        domTarget: "#content",
        activeMenu: "/contact",
        render: function(){
            var html = this.$(this.template).html();
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(html);
        }
    };
});