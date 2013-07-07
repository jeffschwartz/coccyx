define(["coccyx"], function(cx){
    "use strict";

    // Pass either a single controller or an array of controllers
    function start(controllers){
        // Register controllers
        cx.controllers.registerControllers(controllers);

        // Call history.start only after all your controllers have been
        // registered (by calling Coccyx.controllers.registerController).
        cx.history.start(true);
    }

    return {
        start: start
    };

});
