define('history', ['jquery'], function($) {
    'use strict';

    // Verify browser supports pushstate.
    if(!history.pushState){
        console.log('history pushstate is not supported in your browser');
        throw new Error('history pushstate not supported');
    }
    console.log('history pushState is supported in your browser');

    // The 'one' global variable.
    var Coccyx = window.Coccyx = window.Coccyx || {},
        historyStarted = false;

    // Event handler for click event on anchor tags. Ignores those
    // where the href path doesn't start with a '/' character. This
    // prevents handling external links, allowing those events
    // to bubble up as normal.
    $(document).on('click', 'a', function(event){
        if($(this).attr('href').indexOf('/') === 0){
            event.preventDefault();
            var pathName = event.target.pathname;
            // console.log('The url's path = ', ''' + pathName+''');
            // console.log(event);
            // The 'verb' for routes on anchors is always 'get'.
            Coccyx.router.route('get', pathName);
            history.pushState({verb: 'get'}, null, event.target.href);
        }
    });

    // TODO Needs to be implemnted, an event handler for forms.
    // 'Verb' should be set to whatever the form's 'method' attribute
    // is set to. If 'method' attribute doesn' exist, then 'verb'
    // defaults to get.
    $(document).on('submit', 'form', function(event){
        var $form = $(this),
            action = $form.attr('action'),
            method,
            valuesHash;
        console.log(event);
        if(action.indexOf('/') === 0){
            event.preventDefault();
            method = $form.attr('method');
            valuesHash = valuesHashFromSerializedArray($form.serializeArray());
            Coccyx.router.route(method, action, valuesHash);
        }
    });

    // Event handler for popstate event.
    $(window).on('popstate', function(event){
        // Ignore 'popstate' events until history.start is called.
        if(started()){
            Coccyx.router.route(event.originalEvent.state? event.originalEvent.state.verb : 'get', window.location.pathname);
        }
    });

    // Creates a hash from an array whose elements are hashes whose properties are 'name' and 'value'.
    function valuesHashFromSerializedArray(valuesArray){
        var len = valuesArray.length,
            i,
            valuesHash = {};
        for(i = 0; i < len; i++){
            valuesHash[valuesArray[i].name] = valuesArray[i].value;
        }
        return valuesHash;
    }

    function started(){
        return historyStarted;
    }

    // Call Coccyx.history.start only after all your controllers have been
    // registered (by calling Coccyx.controllers.registerController).
    // When called starts responding to 'popstate' events which are raised when the
    // user uses the browser's back and forward buttons to navigate. Pass true for
    // trigger if you want the route function to be called.
    function start(trigger){
        historyStarted = true;
        if(trigger){
            Coccyx.router.route('get', window.location.pathname);
        }
    }

    Coccyx.history = {
        start: start,
        started: started
    };

});
