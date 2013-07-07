require.config({
    baseUrl: "javascripts",
    paths: {
        "coccyx": "libs/coccyx",
        "indexController": "controllers/index_controller",
        "aboutController": "controllers/about_controller",
        "contactController": "controllers/contact_controller",
        "documentationController": "controllers/documentation_controller",
        "examplesController": "controllers/examples_controller",
        "bootstrap": "libs/bootstrap/js/bootstrap",
        "common": "common"
    }

});

require([
    "coccyx",
    "demoapp",
    "indexController",
    "aboutController",
    "examplesController",
    "contactController",
    "documentationController",
    "jquery",
    "common",
    "bootstrap"
    ],
    function(Coccyx, demoapp, indexController, aboutController, examplesController, contactController, documentationController){
        "use strict";

        demoapp.start([indexController, aboutController, examplesController, contactController, documentationController]);
    }
);