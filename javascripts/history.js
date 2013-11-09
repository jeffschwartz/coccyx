define('history', ['application', 'router'], function() {
    'use strict';

    //Verify browser supports pushstate.
    console.log(history.pushState ? 'history pushState is supported in your browser' :
        'history pushstate is not supported in your browser');

    var v = window.Coccyx = window.Coccyx || {}, historyStarted = false;

    //Event handler for click event on anchor tags. Ignores those where the href path doesn't start with
    //a '/' character; this prevents handling external links, allowing those events  to bubble up as normal.
    v.$(document).on('click', 'a', function(event){
        if(v.$(this).attr('href').indexOf('/') === 0){
            event.preventDefault();
            //0.6.0 changed target to currentTarget.
            var pathName = event.currentTarget.pathname;
            //The 'verb' for routes on anchors is always 'get'.
            v.router.route('get', pathName);
            //0.6.0 changed target to currentTarget.
            history.pushState({verb: 'get'}, null, event.currentTarget.href);
        }
    });

    //Event handler for form submit event. Ignores submit events on forms whose action attributes do not
    //start with a '/' character; this prevents handling form submit events for forms whose action
    //attribute values are external links, allowing those events  to bubble up as normal.
    v.$(document).on('submit', 'form', function(event){
        var $form = v.$(this),
            action = $form.attr('action'),
            method = $form.attr('method'),
            valuesHash;
        if(action.indexOf('/') === 0){
            event.preventDefault();
            method = method ? method : 'get';
            valuesHash = valuesHashFromSerializedArray($form.serializeArray());
            v.router.route(method, action, valuesHash);
        }
    });

    //Event handler for popstate event.
    v.$(window).on('popstate', function(event){
        //Ignore 'popstate' events without state and until history.start is called.
        if(event.originalEvent.state && started()){
            v.router.route(event.originalEvent.state.verb , window.location.pathname);
        }
    });

    //Creates a hash from an array whose elements are hashes whose properties are 'name' and 'value'.
    function valuesHashFromSerializedArray(valuesArray){
        var valuesHash = {};
        for(var i = 0, len = valuesArray.length; i < len; i++){valuesHash[valuesArray[i].name] = valuesArray[i].value;}
        return valuesHash;
    }

    function started(){return historyStarted;}

    //Call Coccyx.history.start to start your application. When called starts responding to
    //'popstate' events which are raised when the user uses the browser's back and forward
    //buttons to navigate. Pass true for trigger if you want the route function to be called.
    //0.5.0
    function start(trigger, controllers){
        v.controllers.registerControllers(controllers); //0.5.0
        historyStarted = true;
        history.replaceState({verb: 'get'}, null, window.location.pathname);
        if(trigger){v.router.route('get', window.location.pathname);}
    }

    //A wrapper for the browser's history.pushState and history.replaceState. Whenever you reach
    //a point in your application that you'd like to save as a URL, call navigate in order to update
    //the URL. If you wish to also call the route function, set the trigger option to true. To update
    //the URL without creating an entry in the browser's history, set the replace option to true.
    //Pass true for trigger if you want the route function to be called.
    //Pass true for replace if you only want to replace the current history entry and not
    //push a new one onto the browser's history stack.
    //function navigate(state, title, url, trigger, replace){
    function navigate(options){
        if(v.history.started()){
            options = options || {};
            options.state = options.state || null;
            options.title = options.title || document.title;
            options.method = options.method || 'get';
            options.url = options.url || window.location.pathname;
            options.trigger = options.trigger || false;
            options.replace = options.replace || false;
            window.history[options.replace ? 'replaceState' : 'pushState'](options.state, options.title, options.url);
            if(options.trigger){v.router.route(options.method, options.url);}
        }
    }

    v.history = {start: start, started: started, navigate: navigate};
});
