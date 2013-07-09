define(["coccyx"], function(Coccyx){
    "use strict";

    var showDocumentationPage = function(){
        Coccyx.views.render("documentationView");
    };

    return {
        name: "documentation",
        routes: {
            "get /": showDocumentationPage
        }
    };

});