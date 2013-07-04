(function(cx){
    "use strict";

    var showExamplesPage = function(){
        this.$("#content").html("");
    };

    cx.controllers.registerController({
        name: "examples",
        routes: {
            "/": showExamplesPage
        }
    });
}(window.Coccyx));