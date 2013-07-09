define(["coccyx"], function(Coccyx){
    "use strict";

    /**
     * @param controllers - either an array of or a single controller.
     * @param views - either an array of or a single view.
     */
    function start(controllers, views){
        // Register views.
        Coccyx.views.registerViews(views);
        // Register controllers.
        Coccyx.controllers.registerControllers(controllers);
        // Call history.start only after all your controllers have been
        // registered (by calling Coccyx.controllers.registerController).
        Coccyx.history.start(true);
    }

    return {
        start: start
    };

});
