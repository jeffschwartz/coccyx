/**
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
                v = route.substring(0, route.indexOf(" "))
                // Get the url.
                b = route.substring(1).split("/");
                if((a.length === b.length) || Coccyx.helpers.contains(route, "*")){
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

    function routeNotFound(url){
        console.log("router::routeNotFound called with route = " + url);
        // Show a Coccyx 404 error.
        $("body").html('<div style="font-size:68px;"><p style="margin:auto !important;line-height:80px;">Coccyx 404</p><p style="margin:auto !important;line-height:80px;">' + url + ' Not Found.</p><p style="margin:auto !important;line-height:80px;"> Did you forget to call Coccyx.controllers.registerController to register your controller?</p></div>');
    }

    Coccyx.router = {
        route: route,
        navigate: navigate
    };

 }(jQuery));