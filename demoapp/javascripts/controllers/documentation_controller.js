define(["coccyx"], function(Coccyx){
    "use strict";

    var showDocumentationPage = function(){
        Coccyx.views.render("documentation");
    };

    var showQuickStartGuidePage = function(){
        Coccyx.views.render("quickstartguide");

    };

    var showApiRefferencePage = function(){
        Coccyx.views.render("apirefference");

    };

    return {
        name: "documentation",
        routes: {
            "get /": showDocumentationPage,
            "get quickstartguide": showQuickStartGuidePage,
            "get apirefference": showApiRefferencePage
        }
    };

});