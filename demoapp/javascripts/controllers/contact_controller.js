define(["coccyx"], function(Coccyx){
    "use strict";

    var showContactPage = function(){
        Coccyx.views.render("contactView");
    };

    return {
        name: "contact",
        routes: {
            "get /": showContactPage
        }
    };

});