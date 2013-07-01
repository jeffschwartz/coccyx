/**
 * Router routes urls to their controllers
 */
 (function($){
    "use strict";

    var Coccyx = window.Coccyx = window.Coccyx || {};

    function route(url){
        var rt = getRoute(url);
        if(rt){
            routeFound(rt);
        }else{
            routeNotFound(url);
        }
    }

    function getRoute(url){
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
            relUrl;
        for(route in routes){
            if(routes.hasOwnProperty(route)){
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
                        return {controllerName: b[0], fn: routes[route], params: params};
                    }
                    if(rel){
                        // controller name, function to call, function arguments to call with...
                        for(ii = i, relUrl = ""; ii < a.length; ii++){
                            relUrl += ("/" + a[ii]);
                        }
                        // controller name, function to call, function arguments to call with...
                        return {controllerName: b[0], fn: routes[route], params: [relUrl]};
                    }
                }
            }
        }
    }

    function routeFound(route){
        // TODO  What context should the route callback function be called with????
        // The whole idea is that user might add their own methods to their controllers
        // and like to be able to call them from inside the route callback method.
        // this needs to be thought out more...
        if(route.params.length){
            route.fn.apply(Coccyx.controllers.getController(route.controllerName), route.params);
        }else{
            route.fn.call(Coccyx.controllers.getController(route.controllerName));
        }
    }

    function routeNotFound(url){
        console.log("router::routeNotFound called with route = " + url);
        // Show a Coccyx 404 error.
        $("body").html("<div><p style=\"font-size:68px;margin:0;\">Coccyx 404</p><p style=\"font-size:68px;\">" + url + " Not Found.</p></div>");
    }

    Coccyx.router = {
        route: route
    };

 }(jQuery));