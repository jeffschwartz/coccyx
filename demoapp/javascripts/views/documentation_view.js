define(["coccyx", "common"], function(Coccyx){
    "use strict";

    return {
        name: "documentationView",
        template: "#documentation-page",
        domTarget: "#content",
        activeMenu: "/documentation",
        render: function(){
            var html = this.$(this.template).html();
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(html);
        }
    };
});