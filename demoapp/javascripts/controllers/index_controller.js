define(["common","coccyx"], function(common, Coccyx) {
    "use strict";

    var showIndexPage = function(){
        // Render the index page which is purely static, no dynamic
        // content at all, so no need to use any kind of templating.
        // Coccyx.getView("indexPage").render();
        var html = this.$("#index-page").html(),
            common = Coccyx.userspace.common;
        common.setMenuItemActive("/");
        this.$("#content").html(html);
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
