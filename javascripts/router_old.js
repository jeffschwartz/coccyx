/**
 * Router routes urls to their controllers
 */
 (function($){
    "use strict";

    var Coccyx = window.Coccyx = window.Coccyx || {},
        routes;

    function route(url){
        var cleanedUrl,
            controller;
        console.log("router::route called with url to route = " + url);
        // make sense of the url - split it into cleanedUrl
        cleanedUrl = cleanUrl(url);
        console.log(cleanedUrl);
        controller = findRoute(cleanedUrl);
        if(controller){
            routeFound(controller, cleanedUrl);
        }else{
            routeNotFound(url);
        }
    }

    // remove leading and trailing "/" characters
    function cleanUrl(url){
        var s = url.charAt(0) === "/" ? url.substr(1) : url;
        return url.charAt(url.length - 1) === "/" ? url.substr(0, url.length - 1) : s;
    }

    function findRoute(url){
        var controllers = Coccyx.controllers.get(),
            root,
            i,
            len;
        i = url.indexOf("/");
        root = i > -1 ? url.substr(0, i) : url;

        for(i = 0, len = controllers.length; i < len; i++){
            var controller = controllers[i];
            if(controller.name === root){
                return controller;
            }
        }
    }

    function routeFound(controller, segments){
        var i,
            len,
            r,
            s;
        if(segments.length === 1) s = "/";
        for(r in controller.nouns){
            if(controller.nouns.hasOwnProperty(r)){
        }
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