/**
 * Front-End controller - it routes paths to the appropriate controller
 */
 (function(){
    var Coccyx = window.Coccyx = window.Coccyx || {},
    controllers = {};
    routes = {};

    /**
     * Controller
     * {name: root} - the root refers to the 1st segment of the pathname of the url
     * so if the pathanme of the url is "/controller/noun" then root = controller.
     */

     function registerController(){
        if(arguments.length !== 1 && !(arguments[0] instanceof Array) && !(arguments[0] instanceof Object)){
            throw new Error("registerController missing or invalid param. Expection an [] or {}.");
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
        // Add controller to controllers array.
        controllers[controller.name] = controller;
        // Add each route to routes array.
        for(var route in controller.routes){
            if(controller.routes.hasOwnProperty(route)){
                if(route === "/"){
                    namedRoute = tmp;
                }else{
                    namedRoute = tmp + route;
                }
                routes[namedRoute] = controller.routes[route];
            }
        }
    }

    function getRoutes(){
        return routes;
    }

    function getController(name){
        var ctlr = controllers[name];
        return ctlr;
    }

    Coccyx.controllers = {
        registerController : registerController,
        getRoutes: getRoutes,
        getController: getController
    };

}());