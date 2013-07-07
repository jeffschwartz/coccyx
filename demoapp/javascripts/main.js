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
    "jquery",
    "common",
    "bootstrap",
    "indexController"
    ],
    function(Coccyx){
        "use strict";

        // Call history.start only after all your controllers have been
        // registered (by calling Coccyx.controllers.registerController).
        Coccyx.history.start(true);
    }
);