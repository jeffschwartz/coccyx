define(["coccyx"], function(Coccyx){
    "use strict";

    var showBlogPage = function(){
        Coccyx.views.render("blogView");
    };

    return {
        name: "blog",
        routes: {
            "get /": showBlogPage
        }
    };

});