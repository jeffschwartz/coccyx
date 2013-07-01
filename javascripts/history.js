(function(){
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

    function started(){
        return historyStarted;
    }

    // Call to push a url to change the browser location, which you
    // might need to do to when processing your route events.
    // Pass true for trigger if you want to trigger the history event.
    function push(url, trigger){
        history.pushState();
    }

    // When called starts listening for "popstate" events which are raised when the
    // user uses the browser's back and forward buttons to navigate.
    function start(trigger){
        var triggerPopState = trigger;
        historyStarted = true;
        // Delegate click events on anchor tags to the body element and assign an event handler
        $("a","body").on("click", function(event){
            /**
             * We don't want to block external links or those to our domain which we don't want to process
             * via ajax, so this code checks for that by checking the first character in the href.
             * If the first character is "/" then we block its default behavior, otherwsie we let the event
             * bubble as normal.
             */
             if($(this).attr("href").indexOf("/") === 0){
                event.preventDefault();
                var pathName = event.target.pathname;
                console.log("The url's path = ", "'" + pathName+"'");
                console.log(event);
                history.pushState({},"Some Place",event.target.href);
                Coccyx.router.route(window.location.pathname);
             }
        });
        $(window).on("popstate", function(){
            // trigger 1st time only if user passed true to start
            if(started() && triggerPopState){
                //alert("popstate event fired!");
                Coccyx.router.route(window.location.pathname);
            }
            // Insure that all future popstate events will now be handled - see trigger.
            triggerPopState = true;
        });
    }

    Coccyx.history = {
        start: start,
        started: started,
        push: push
    };

}());
