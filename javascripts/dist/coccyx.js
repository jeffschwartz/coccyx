**
 * Front-End controller - it routes paths to the appropriate controller
 */
 (function($){
    "use strict";

    var Coccyx = window.Coccyx = window.Coccyx || {},
        controllers = {},
        routes = {};

    /**
     * Controller
     * {name: root} - the root refers to the 1st segment of the pathname of the url
     * so if the pathanme of the url is "/controller/noun" then root = controller.
     */

     function registerControllers(){
        if(arguments.length !== 1 && !(arguments[0] instanceof Array) && !(arguments[0] instanceof Object)){
            // TODO Not sure if I should be throwing here. Think about it!!!
            throw new Error("registerControllers missing or invalid param. Expected an [] or {}.");
        }
        if(arguments[0] instanceof Array){
            // An array of hashes.
            arguments[0].forEach(function(controller){
                loadRoutesFromController(controller);
            });
        }else{
            // A single hash.
            loadRoutesFromController(arguments[0]);
        }
    }

    function loadRoutesFromController(controller){
        var tmp = "/" + controller.name,
            namedRoute;
        console.log("Registering controller '" + controller.name + "'");
        // controller's local $
        controller.$ = $;
        // Maintain list of controllers for when we need to bind them to route function callbacks.
        controllers[controller.name] = controller;
        // Build the routes array.
        for(var route in controller.routes){
            if(controller.routes.hasOwnProperty(route)){
                if(route.substring(route.indexOf(" ") + 1) === "/"){
                    namedRoute = route.substring(0, route.indexOf(" ") + 1) + tmp;
                }else{
                    namedRoute = route.substring(0, route.indexOf(" ") + 1) + tmp + route.substring(route.indexOf(" ") + 1);
                }
                routes[namedRoute] = [controller.name,controller.routes[route]];
            }
        }
    }

    function getRoutes(){
        return routes;
    }

    function getController(name){
        return controllers[name];
    }

    // Provide jQuery in the Coccyx name space.
    Coccyx.$ = $;

    // Provide a bucket for end-user application stuff.
    Coccyx.userspace = Coccyx.userspace || {};

    // Provide a bucket for Coccyx library plug-ins.
    Coccyx.plugins = Coccyx.plugins || {};

    // Define what a controller is.
    Coccyx.controllers = {
        registerControllers : registerControllers,
        getRoutes: getRoutes,
        getController: getController
    };

}(jQuery));
;(function(){
    "use strict";

    var Coccyx = window.Coccyx = window.Coccyx || {};

    Coccyx.helpers = {
        contains: function(s1, s2){
            var i, len;
            if(typeof s1 === "string"){
                for(i = 0, len = s1.length; i < len; i++){
                    if(s1[i] === s2) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
}());;(function($){
    "use strict";

    // Verify browser supports pushstate.
    if(!history.pushState){
        console.log("history pushstate is not supported in your browser");
        throw new Error("history pushstate not supported");
    }
    console.log("history pushState is supported in your browser");

    // The "one" global variable.
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
            // console.log("The url's path = ", "'" + pathName+"'");
            // console.log(event);
            // The "verb" for routes on anchors is always "get".
            Coccyx.router.route("get", pathName);
            history.pushState({verb: "get"}, null, event.target.href);
        }
    });

    // TODO Needs to be implemnted, an event handler for forms.
    // 'Verb' should be set to whatever the form's 'method' attribute
    // is set to. If 'method' attribute doesn' exist, then 'verb'
    // defaults to get.
    $(document).on("submit", "form", function(/*event*/){
        alert("form submit event caught by router *** needs to be implemented ***");
    });

    // Event handler for popstate event.
    $(window).on("popstate", function(event){
        // Ignore "popstate" events until history.start is called.
        if(started()){
            Coccyx.router.route(event.originalEvent.state? event.originalEvent.state: "get", window.location.pathname);
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
            Coccyx.router.route("get", window.location.pathname);
        }
    }

    Coccyx.history = {
        start: start
    };

}(jQuery));
;(function($){
    "use strict";

    var Coccyx = window.Coccyx = window.Coccyx || {};


    function registerModel(model){

    }

    Coccyx.models = {
        registerModel: registerModel
    };
 }(jQuery));;/**
 * Router routes urls to their controllers
 */
 (function($){
    "use strict";

    var Coccyx = window.Coccyx = window.Coccyx || {};

    function route(verb, url){
        var rt = getRoute(verb, url);
        if(rt){
            routeFound(rt);
        }else{
            routeNotFound(verb, url);
        }
    }

    function getRoute(verb, url){
        var routes = Coccyx.controllers.getRoutes(),
            a = url.substring(1).split("/"),
            route,
            b,
            i,
            ii,
            len,
            eq,
            params = [],
            rel = false,
            relUrl,
            v;
        for(route in routes){
            if(routes.hasOwnProperty(route)){
                // Get the "veb".
                v = route.substring(0, route.indexOf(" "));
                // Get the url.
                b = route.substring(route.indexOf("/") + 1).split("/");
                if(verb === v && (a.length === b.length || Coccyx.helpers.contains(route, "*"))){
                    eq = true;
                    // The url and the route have the same number of segments so the route
                    // can be either static or it could contain parameterized segments.
                    for(i = 0, len = b.length; i < len; i++){
                        // If the segments are equal then continue looping.
                        if(a[i] === b[i]){
                            continue;
                        }
                        // If the route segment is parameterized then save the parameter and continue looping.
                        if(b[i].charAt(0) === ":"){
                            //params.push({segmentNumber: i, value: a[i]});
                            params.push(a[i]);
                            continue;
                        }
                        // If the route is a relative route, push it onto the array and break out of the loop.
                        if(Coccyx.helpers.contains(b[i], "*")){
                            rel = true;
                            eq = false;
                            break;
                        }
                        // If none of the above
                        eq = false;
                        break;
                    }
                    // The route matches the url so attach the params (it could be empty) to the route and return the route.
                    if(eq){
                        // controller name, function to call, function arguments to call with...
                        return {controllerName: /*b[0]*/ routes[route][0], fn: routes[route][1], params: params};
                    }
                    if(rel){
                        // controller name, function to call, function arguments to call with...
                        for(ii = i, relUrl = ""; ii < a.length; ii++){
                            relUrl += ("/" + a[ii]);
                        }
                        // controller name, function to call, function arguments to call with...
                        return {controllerName: /*b[0]*/ routes[route][0], fn: routes[route][1], params: [relUrl]};
                    }
                }
            }
        }
    }

    function routeFound(route){
        // Route callbacks are bound (their contexts (their 'this')) to their controllers.
        if(route.params.length){
            route.fn.apply(Coccyx.controllers.getController(route.controllerName), route.params);
        }else{
            route.fn.call(Coccyx.controllers.getController(route.controllerName));
        }
    }

    function routeNotFound(url){
        console.log("router::routeNotFound called with route = " + url);
        // Show a Coccyx 404 error.
        $("body").html('<div style="font-size:68px;"><p style="margin:auto !important;line-height:80px;">Coccyx 404</p><p style="margin:auto !important;line-height:80px;">' + url + ' Not Found.</p><p style="margin:auto !important;line-height:80px;"> Did you forget to call Coccyx.controllers.registerController to register your controller?</p></div>');
    }

    // A wrapper for the browser's history.pushState and history.replaceState.
    // Mimic Backbone's History.navigate method.
    // "Whenever you reach a point in your application that you'd like to save as a URL,
    // call navigate in order to update the URL. If you wish to also call the route function,
    // set the trigger option to true. To update the URL without creating an entry in the
    // browser's history, set the replace option to true."
    // Pass true for trigger if you want the route function to be called.
    // Pass true for replace if you only want to replace the current history entry and not
    // push a new one onto the browser's history stack.
    // function navigate(state, title, url, trigger, replace){
    function navigate(options){
        options = options || {};
        options.state = options.state || null;
        options.state.coccyxUrl = options.url || null;
        options.title = options.title || document.title;
        options.url = options.url || window.location.pathname;
        options.trigger = options.trigger || false;
        options.replace = options.replace || false;
        window.history[options.replace ? "replaceState" : "pushState"](options.state, options.title, options.url);
        if(options.trigger){
            route(options.url);
        }
    }

    Coccyx.router = {
        route: route,
        navigate: navigate
    };

 }(jQuery));;(function(){
    "use strict";
    if ( typeof define === "function" && define.amd ) {
        define("coccyx", ["jquery"], function () { return window.Coccyx; } );
    }

}());