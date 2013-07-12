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
                    namedRoute = route.substring(0, route.indexOf(" ") + 1) + tmp + "/" + route.substring(route.indexOf(" ") + 1);
                }
                routes[namedRoute] = [controller.name,controller.routes[route]];
                console.log("Registering route '" + namedRoute + "'");
            }
        }
    }

    function getRoutes(){
        return routes;
    }

    function getController(name){
        return controllers[name];
    }

    // TODO should I be doing this?????
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