require.config({
    baseUrl: "javascripts",
    paths: {
        "coccyx": "libs/coccyx",
        "indexController": "controllers/index_controller",
        "bootstrap": "libs/bootstrap/js/bootstrap",
        "common": "common"
    }

});

require([
    "coccyx",
    "demoapp",
    "indexController",
    "jquery",
    "common",
    "bootstrap"
    ],
    function(Coccyx, demoapp, indexController){
        "use strict";

        demoapp.start(indexController);
    }
);