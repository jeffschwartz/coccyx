define(["coccyx"], function(Coccyx){
    "use strict";

    var showDocumentationPage = function(){
        Coccyx.views.render("documentationView");
    };

    var showQuickStartGuidePage = function(){
        Coccyx.views.render("quickStartGuideView");

    };

    var showApiRefferencePage = function(){
        Coccyx.views.render("apiRefferenceView");

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