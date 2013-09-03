define('application', ['jquery'], function($){
    'use strict';

    var Coccyx = window.Coccyx = window.Coccyx || {},
        controllers = {},
        routes = {},
        version;

     function registerControllers(){
        if(arguments.length !== 1 && !(arguments[0] instanceof Array) && !(arguments[0] instanceof Object)){
            console.log('registerControllers missing or invalid param. Expected an [] or {}.');
        }
        if(arguments[0] instanceof Array){
            //An array of hashes.
            arguments[0].forEach(function(controller){
                loadRoutesFromController(controller);
            });
        }else{
            //A single hash.
            loadRoutesFromController(arguments[0]);
        }
    }

    function loadRoutesFromController(controller){
        var namedRoute;
        console.log('Registering controller \'' + controller.name + '\'');
        //controller's local $
        controller.$ = $;
        //Maintain list of controllers for when we need to bind them to route function callbacks.
        controllers[controller.name] = controller;
        //Build the routes array.
        for(var route in controller.routes){
            if(controller.routes.hasOwnProperty(route)){
                //Verb + ' /'.
                namedRoute = route.substring(0, route.indexOf(' ') + 1) + '/';
                //Controller name (the root segment).
                namedRoute += controller.name;
                //Remaining path.
                namedRoute += (route.substring(route.indexOf(' ') + 1) === '/' ?
                    '' : controller.name === '' ? route.substring(route.indexOf(' ') + 1) :
                    '/' + route.substring(route.indexOf(' ') + 1));
                routes[namedRoute] = [controller.name,controller.routes[route]];
                console.log('Registering route \'' + namedRoute + '\'');
            }
        }
    }

    function getRoutes(){
        return routes;
    }

    function getController(name){
        return controllers[name];
    }

    //Provide jQuery in the Coccyx name space.
    Coccyx.$ = $;

    //Provide a bucket for end-user application stuff.
    Coccyx.userspace = Coccyx.userspace || {};

    //Provide a bucket for Coccyx library plug-ins.
    Coccyx.plugins = Coccyx.plugins || {};

    //Version stamp
    version = '0.6.0';
    Coccyx.getVersion = function(){
        return version;
    };

    //Define what a controller is.
    Coccyx.controllers = {
        registerControllers : registerControllers,
        getRoutes: getRoutes,
        getController: getController
    };

});
