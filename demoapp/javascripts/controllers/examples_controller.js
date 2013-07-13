define(["coccyx"], function(Coccyx) {
    "use strict";

    var showExamplesPage = function(){
        Coccyx.views.render("examples");
    };

    var postFormExample = function(formValuesHash){
         alert(JSON.stringify(formValuesHash));
    };

    return {
        name: "examples",
        routes: {
            "get /": showExamplesPage,
            "post form": postFormExample
        }
    };

});
