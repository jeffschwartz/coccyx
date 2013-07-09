define(["coccyx", "common"], function(Coccyx){
    "use strict";

    return {
        name: "examplesView",
        template: "#examples-page",
        domTarget: "#content",
        activeMenu: "/examples",
        render: function(){
            var html = this.$(this.template).html();
            Coccyx.userspace.common.setMenuItemActive(this.activeMenu);
            this.$(this.domTarget).html(html);
        }
    };
});