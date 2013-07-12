require.config({
    baseUrl: "javascripts",
    paths: {
        "coccyx": "libs/coccyx",
        "indexController": "controllers/index_controller",
        "blogController": "controllers/blog_controller",
        "contactController": "controllers/contact_controller",
        "documentationController": "controllers/documentation_controller",
        "examplesController": "controllers/examples_controller",
        "quickstartguideController": "controllers/quickstartguide_controller",
        "apirefferenceController": "controllers/apirefference_controller",
        "indexPageView": "views/index_view",
        "examplesPageView": "views/examples_view",
        "documentationPageView": "views/documentation_view",
        "contactPageView": "views/contact_view",
        "blogPageView": "views/blog_view",
        "quickstartguideView": "views/quickstartguide_view",
        "apirefferenceView": "views/apirefference_view",
        "bootstrap": "libs/bootstrap/js/bootstrap",
        "handlebars": "libs/handlebars",
        "templates": "templates/hb",
        "common": "common"
    },
    shim: {
        "templates": ["handlebars"],
        "handlebars": {
            exports: "Handlebars"
        }
    }

});

require([
    "demoapp",
    "indexController",
    "blogController",
    "examplesController",
    "contactController",
    "documentationController",
    "quickstartguideController",
    "apirefferenceController",
    "indexPageView",
    "examplesPageView",
    "documentationPageView",
    "contactPageView",
    "blogPageView",
    "quickstartguideView",
    "apirefferenceView"
    ],
    function(demoapp, indexController, blogController, examplesController, contactController, documentationController, quickstartguideController, apirefferenceController, indexPageView, examplesPageView, documentationPageView, contactPageView, blogPageView, quickstartguideView, apirefferenceView){
        "use strict";

        demoapp.start(
            [indexController, blogController, examplesController, contactController, documentationController, quickstartguideController, apirefferenceController],
            [indexPageView, examplesPageView,documentationPageView, contactPageView, blogPageView, quickstartguideView, apirefferenceView]
        );
    }
);