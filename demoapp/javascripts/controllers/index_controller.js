define(["coccyx"], function(Coccyx) {
    "use strict";

    var showIndexPage = function(){
        Coccyx.views.render("indexView");
    };

    var showTinyAndSimplePage = function(){
        var html = this.$("#tiny-and-simple-page").html();
        this.$("#content").html(html);
    };

    var showModernPage = function(){
        var html = this.$("#tiny-and-simple-page").html();
        this.$("#content").html(html);
    };

    var showBestPracticesPage = function(){
        var html = this.$("#tiny-and-simple-page").html();
        this.$("#content").html(html);
    };

    return {
        name: "",
        routes: {
            "get /": showIndexPage,
            "get tinysimple": showTinyAndSimplePage,
            "get modern": showModernPage,
            "get bestpractices": showBestPracticesPage
        }
    };

});
