define('history', ['jquery', 'router'], function($) {
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
        // Ignore 'popstate' events without state and until history.start is called.
        if(event.originalEvent.state && started()){
            Coccyx.router.route(event.originalEvent.state.verb , window.location.pathname);
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

    // 0.5.0
    function registerControllers(controllers){
        Coccyx.controllers.registerControllers(controllers);
    }

    // Call Coccyx.history.start to start your application.
    // When called starts responding to 'popstate' events which are raised when the
    // user uses the browser's back and forward buttons to navigate. Pass true for
    // trigger if you want the route function to be called.
    // 0.5.0
    function start(trigger, callback){
        registerControllers(callback()); // 0.5.0
        historyStarted = true;
        if(trigger){
            history.replaceState({verb: 'get'}, null, window.location.pathname);
            Coccyx.router.route('get', window.location.pathname);
        }
    }

    // A wrapper for the browser's history.pushState and history.replaceState.
    // Whenever you reach a point in your application that you'd like to save as a URL,
    // call navigate in order to update the URL. If you wish to also call the route function,
    // set the trigger option to true. To update the URL without creating an entry in the
    // browser's history, set the replace option to true.
    // Pass true for trigger if you want the route function to be called.
    // Pass true for replace if you only want to replace the current history entry and not
    // push a new one onto the browser's history stack.
    // function navigate(state, title, url, trigger, replace){
    function navigate(options){
        if(Coccyx.history.started()){
            options = options || {};
            options.state = options.state || null;
            options.title = options.title || document.title;
            options.method = options.method || 'get';
            options.url = options.url || window.location.pathname;
            options.trigger = options.trigger || false;
            options.replace = options.replace || false;
            window.history[options.replace ? 'replaceState' : 'pushState'](options.state, options.title, options.url);
            if(options.trigger){
                Coccyx.router.route(options.method, options.url);
            }
        }
    }

    Coccyx.history = {
        start: start,
        started: started,
        navigate: navigate
    };

});
