define(["coccyx", "common"], function(Coccyx){
    "use strict";

    return {
        name: "aboutView",
        template: "#about-page",
        domTarget: "#content",
        activeMenu: "/about",
        render: function(){
            var html = this.$(this.template).html();
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(html);
        }
    };
});