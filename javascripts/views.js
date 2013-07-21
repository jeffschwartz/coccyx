define('views', ['jquery'], function($){
    'use strict';

    var Coccyx = window.Coccyx = window.Coccyx || {},
        views = {};

    function registerViews(){

        if(arguments.length !== 1 && !(arguments[0] instanceof Array) && !(arguments[0] instanceof Object)){
            // TODO Not sure if I should be throwing here. Think about it!!!
            throw new Error('registerViews missing or invalid param. Expected an [] or {}.');
        }
        if(arguments[0] instanceof Array){
            // An array of hashes.
            arguments[0].forEach(function(view){
                loadView(view);
            });
        }else{
            // A single hash.
            loadView(arguments[0]);
        }
    }

    function loadView(view){
        view.$ = $;
        views[view.name] = view;
        console.log('Registering view \'' + view.name + '\'');
    }

    function render(name){
        var view = getView(name);
        if(view){
            if(view.render){
                viewRender(view, arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null);
            }
        }else{
            viewNotFound(name);
        }
    }

    function remove(name){
        var view = getView(name);
        if(view){
            if(view.remove){
                view.remove();
            }
        }else{
            viewNotFound(name);
        }
    }

    function getView(name){
        if(views.hasOwnProperty(name)){
            return views[name];
        }
    }

    // Call the view's render method.
    function viewRender(view, args){
        if(args && args.length){
            view.render.apply(view, args);
        }else{
            view.render.call(view);
        }
    }

    function viewNotFound(name){
        // TODO: Is logging to the console required? Is it enough? Etc...
        console.log('views::viewNotFound called with view name = ' + name);
    }

    Coccyx.views = {
        registerViews: registerViews,
        render: render,
        remove: remove
    };

});
