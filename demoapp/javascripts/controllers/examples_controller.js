define(["coccyx"], function(Coccyx) {
    "use strict";

    var showExamplesPage = function(){
        Coccyx.views.render("examples");
    };

    return {
        name: "examples",
        routes: {
            "get /": showExamplesPage
        }
    };

});
