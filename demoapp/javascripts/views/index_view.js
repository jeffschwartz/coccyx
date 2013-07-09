define(["coccyx", "common"], function(Coccyx){
    "use strict";

    return {
        name: "indexView",
        template: "#index-page",
        domTarget: "#content",
        activeMenu: "/",
        render: function(){
            var html = this.$(this.template).html();
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(html);
        }
    };
});