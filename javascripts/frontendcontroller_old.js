/**
 * Front-End controller - it routes paths to the appropriate controller
 */
(function(){
    var Coccyx = window.Coccyx = window.Coccyx || {},
        controllers = [];

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
            controllers.forEach(function(hash){
                controllers.push(hash);
            });
        }else{
            // A single hash.
            controllers.push(arguments[0]);
        }
    }

    function get(){
        return controllers;
    }

    Coccyx.controllers = {
        registerController : registerController,
        get: get
    };

}());