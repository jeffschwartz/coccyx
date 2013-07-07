define(["coccyx"], function(Coccyx){
    "use strict";

    // Pass either a single controller or an array of controllers
    function start(controllers){
        // Register controllers
        Coccyx.controllers.registerControllers(controllers);

        // Call history.start only after all your controllers have been
        // registered (by calling Coccyx.controllers.registerController).
        Coccyx.history.start(true);
    }

    return {
        start: start
    };

});
