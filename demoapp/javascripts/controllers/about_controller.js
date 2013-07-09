define(["coccyx"], function(Coccyx){
    "use strict";

    var showAboutPage = function(){
        Coccyx.views.render("aboutView");
    };

    return {
        name: "about",
        routes: {
            "get /": showAboutPage
        }
    };

});