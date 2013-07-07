define(["coccyx"], function(Coccyx){

    "use strict";

    function setMenuItemActive(targetHref){
        Coccyx.$("ul.nav").find("li.active").removeClass("active");
        Coccyx.$("ul.nav").find("li").has("a[href='" + targetHref + "']").addClass("active");
    }

    Coccyx.userspace = Coccyx.userspace || {};
    Coccyx.userspace.common = {
        setMenuItemActive: setMenuItemActive
    };

});
