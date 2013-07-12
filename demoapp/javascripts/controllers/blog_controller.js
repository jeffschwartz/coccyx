define(["coccyx"], function(Coccyx){
    "use strict";

    var showBlogPage = function(){
        Coccyx.views.render("blog");
    };

    return {
        name: "blog",
        routes: {
            "get /": showBlogPage
        }
    };

});