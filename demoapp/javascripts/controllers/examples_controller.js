(function(cx){
    "use strict";

    var showExamplesPage = function(){
        alert("showExamplesPage called!");
        this.$("body").html("");
    };

    cx.controllers.registerController({
        name: "examples",
        routes: {
            "/": showExamplesPage
        }
    });
}(window.Coccyx));