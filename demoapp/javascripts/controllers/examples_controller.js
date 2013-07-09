define(["coccyx"], function(Coccyx) {
    "use strict";

    var showExamplesPage = function(){
        Coccyx.views.render("examplesView");
    };

    return {
        name: "examples",
        routes: {
            "get /": showExamplesPage
        }
    };

});
