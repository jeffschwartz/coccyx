define(["coccyx"], function(Coccyx) {
    "use strict";

    var showIndexPage = function(){
        Coccyx.views.render("index");
    };

    return {
        name: "",
        routes: {
            "get /": showIndexPage
        }
    };

});
