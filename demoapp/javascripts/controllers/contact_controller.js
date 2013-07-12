define(["coccyx"], function(Coccyx){
    "use strict";

    var showContactPage = function(){
        Coccyx.views.render("contact");
    };

    return {
        name: "contact",
        routes: {
            "get /": showContactPage
        }
    };

});