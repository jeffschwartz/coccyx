require.config({
    baseUrl: "javascripts",
    paths: {
        "coccyx": "libs/coccyx",
        "indexController": "controllers/index_controller",
        "aboutController": "controllers/about_controller",
        "contactController": "controllers/contact_controller",
        "documentationController": "controllers/documentation_controller",
        "examplesController": "controllers/examples_controller",
        "indexPageView": "views/index_view",
        "examplesPageView": "views/examples_view",
        "documentationPageView": "views/documentation_view",
        "contactPageView": "views/contact_view",
        "aboutPageView": "views/about_view",
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
    "aboutController",
    "examplesController",
    "contactController",
    "documentationController",
    "indexPageView",
    "examplesPageView",
    "documentationPageView",
    "contactPageView",
    "aboutPageView"
    ],
    function(demoapp, indexController, aboutController, examplesController, contactController, documentationController, indexPageView, examplesPageView, documentationPageView, contactPageView, aboutPageView){
        "use strict";

        demoapp.start(
            [indexController, aboutController, examplesController, contactController, documentationController],
            [indexPageView, examplesPageView,documentationPageView, contactPageView, aboutPageView]
        );
    }
);