(function($){
    "use strict";

    var Coccyx = window.Coccyx = window.Coccyx || {},
        views = {};

    function registerViews(){

        if(arguments.length !== 1 && !(arguments[0] instanceof Array) && !(arguments[0] instanceof Object)){
            // TODO Not sure if I should be throwing here. Think about it!!!
            throw new Error("registerViews missing or invalid param. Expected an [] or {}.");
        }
        if(arguments[0] instanceof Array){
            // An array of hashes.
            arguments[0].forEach(function(view){
                loadViews(view);
            });
        }else{
            // A single hash.
            loadViews(arguments[0]);
        }
    }

    function loadViews(view){
        view.$ = $;
        views[view.name] = view;
    }

    function render(name){
        var view = findView(name);
        if(view){
            viewFound(view, Array.prototype.slice.call(arguments));
        }else{
            viewNotFound(name);
        }
    }

    function findView(name){
        if(views.hasOwnProperty(name)){
            return views[name];
        }
    }

    // Call the view's render method with the view as its context.
    function viewFound(view, args){
        view.render.appy(view, args);
    }

    function viewNotFound(name){
        console.log("views::viewNotFound called with view name = " + name);
    }

    Coccyx.views = {
        registerViews: registerViews,
        render: render
    };

}(jQuery));