(function($){
    "use strict";

    if(!history.pushState){
        // TODO - I don't think throwing an error is a good idea here.
        // Perhaps it is best leaving it up to the user to decide what
        // to do.
        throw new Error("history.pushState is not supported in your browser!");
    }
    console.log("history pushState is supported in your browser");

    var Coccyx = window.Coccyx = window.Coccyx || {},
        historyStarted = false;

    // Event handler for click event on anchor tags. Ignores those
    // where the href path doesn't start with a "/" character. This
    // prevents handling external links, allowing those events
    // to bubble up as normal.
    $(document).on("click", "a", function(event){
        if($(this).attr("href").indexOf("/") === 0){
            event.preventDefault();
            var pathName = event.target.pathname;
            console.log("The url's path = ", "'" + pathName+"'");
            console.log(event);
            // Coccyx.router.route(window.location.pathname);
            Coccyx.router.route(pathName);
            history.pushState(null, null, event.target.href);
        }
    });

    $(window).on("popstate", function(event){
        // Normalize browser differences for onpageload handling.
        // Safari & Chrome fire popstate events on page load while
        // Firefox doesn't. We only want to respond to popstate
        // events that are results of our pushing to history.
        // If it isn't ours then just ignore it.
        if(started()){
            Coccyx.router.route(window.location.pathname);
        }
    });

    function started(){
        return historyStarted;
    }

    // Call Coccyx.history.start only after all your controllers have been
    // registered (by calling Coccyx.controllers.registerController).
    // When called starts responding to "popstate" events which are raised when the
    // user uses the browser's back and forward buttons to navigate. Pass true for
    // trigger if you want the route function to be called.
    function start(trigger){
        historyStarted = true;
        if(trigger){
            Coccyx.router.route(window.location.pathname);
        }
    }

    Coccyx.history = {
        start: start
    };

}(jQuery));
