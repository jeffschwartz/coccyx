// Coccyx.js 0.1.0
// (c) 2013 Jeffrey Schwartz
// Coccyx.js may be freely distributed under the MIT license.
// For all details and documentation:
// http://coccyxjs.jitsu.com
;define("application", ["jquery"], function($){
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
        var namedRoute;
        console.log("Registering controller '" + controller.name + "'");
        // controller's local $
        controller.$ = $;
        // Maintain list of controllers for when we need to bind them to route function callbacks.
        controllers[controller.name] = controller;
        // Build the routes array.
        for(var route in controller.routes){
            if(controller.routes.hasOwnProperty(route)){
                // Verb + " /".
                namedRoute = route.substring(0, route.indexOf(" ") + 1) + "/";
                // Controller name (the root segment).
                namedRoute += controller.name;
                // Remaining path.
                namedRoute += (route.substring(route.indexOf(" ") + 1) === "/" ? "" : controller.name === "" ? route.substring(route.indexOf(" ") + 1) : "/" + route.substring(route.indexOf(" ") + 1));
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

});

;define("helpers", [], function(){
    "use strict";

    var Coccyx = window.Coccyx = window.Coccyx || {};

    Coccyx.helpers = {
        // Returns true if s1 contains s2, otherwise returns false.
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
        },
        // Returns a deep copy object o.
        deepCopy: function(o){
            return JSON.parse(JSON.stringify(o));
        },
        // Pass one or more objects as the source objects whose
        // properties are to be copied to the target object.
        extend: function(targetObj){
            var property,
                i,
                len = arguments.length - 1;
            for(i = 1; i <= len; i++){
                var src = arguments[i];
                for(property in src){
                    if(src.hasOwnProperty(property)){
                        targetObj[property] = src[property];
                    }
                }
            }
            return targetObj;
        }
    };

});

;define("history", ["jquery"], function($) {
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
    $(document).on("submit", "form", function(event){
        var $form = $(this),
            action = $form.attr("action"),
            method,
            valuesHash;
        console.log(event);
        if(action.indexOf("/") === 0){
            event.preventDefault();
            method = $form.attr("method");
            valuesHash = valuesHashFromSerializedArray($form.serializeArray());
            Coccyx.router.route(method, action, valuesHash);
        }
    });

    // Event handler for popstate event.
    $(window).on("popstate", function(event){
        // Ignore "popstate" events until history.start is called.
        if(started()){
            Coccyx.router.route(event.originalEvent.state? event.originalEvent.state.verb : "get", window.location.pathname);
        }
    });

    // Creates a hash from an array whose elements are hashes whose properties are "name" and "value".
    function valuesHashFromSerializedArray(valuesArray){
        var len = valuesArray.length,
            i,
            valuesHash = {};
        for(i = 0; i < len; i++){
            valuesHash[valuesArray[i].name] = valuesArray[i].value;
        }
        return valuesHash;
    }

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
        start: start,
        started: started
    };

});

;define("models", [], function(){
    "use strict";

    /**
     * Model
     * Warning!!!! Don't use primitive object wrappers, Date objects or functions as data
     * property values. This is because model uses JSON.parse(JSON.stringify(data)) to
     * perform a deep copy of your model data and JSON doesn't support primitive object
     * wrappers, Date objects or functions.
     * (see https://developer.mozilla.org/en-US/docs/JSON for details)
     * Deep copying is necessary to isolate the originalValues and changedValues from
     * changes made in data. If you don't heed this warning bad things _will_ happen!!!
     */

    var Coccyx = window.Coccyx = window.Coccyx || {},
        models = {},
        deepCopy = Coccyx.helpers.deepCopy,
        proto;

    function registerModels(){

        if(arguments.length !== 1 && !(arguments[0] instanceof Array) && !(arguments[0] instanceof Object)){
            // TODO Not sure if I should be throwing here. Think about it!!!
            throw new Error("registerModels missing or invalid param. Expected an [] or {}.");
        }
        if(arguments[0] instanceof Array){
            // An array of hashes.
            arguments[0].forEach(function(model){
                loadModel(model);
            });
        }else{
            // A single hash.
            loadModel(arguments[0]);
        }
    }

    function loadModel(model){
        // Create a new object based on proto and extend
        // that with the model and save it in the hash.
        var obj =  Coccyx.helpers.extend(Object.create(proto), model);
        models[model.name] = obj;
        console.log("Registering model '" + model.name + "'");
    }

    function getModel(name){
        var obj;
        if(models.hasOwnProperty(name)){
            // Create a new object using the model as the prototype.
            obj = Object.create(models[name]);
            // Decorate the new object with its own properties.
            obj.set = false;
            obj.readOnly = false;
            obj.dirty = false;
            obj.originalData = {};
            obj.changedData = {};
            obj.data = {};
            return obj;
        }
    }

    // model prototype properties...
    proto = {
        setData: function setData (dataHash, options) {
            var o = {empty:false, readOnly:false, dirty:false},
                prop;
            // If there is a validate method and it return false, set valid to
            // false and return false.
            // If there is a validate method and it returns true, set valid to true
            // and proceed with setting data.
            this.valid = this.validate ? this.validate(dataHash) : true;
            if(!this.valid){
                return false;
            }
            // Merge default options with passed in options.
            if(options){
                for(prop in o){
                    if(o.hasOwnProperty(prop) && options.hasOwnProperty(prop)){
                        o[prop] = options[prop];
                    }
                }
            }
            // Deep copy.
            this.originalData = o.empty ? {} : deepCopy(dataHash);
            this.readOnly = o.readOnly;
            this.dirty = o.dirty;
            // Deep copy.
            this.data = deepCopy(dataHash);
            this.changedData = {};
            this.set = true;
            return true;
        },
        getData: function getData(){
            return deepCopy(this.data);
        },
        getProperty: function getProperty(propertyName){
            return this.data[propertyName];
        },
        setProperty: function setProperty(propertyName, data){
            // A model's data properties cannot be written to if the model
            // hasn't been set yet or if the model is read only.
            if(this.set && !this.readOnly){
                // Deep copy, maintain the changedValues hash.
                this.changedData[propertyName] = deepCopy(data);
                this.data[propertyName] = data;
                this.dirty = true;
            }else{
                console.log("Warning! Coccyx.model::setProperty called on read only model.");
            }
            // For chaining.
            return this;
        }
    };

    Coccyx.models = {
        registerModels: registerModels,
        getModel: getModel
    };

});

;define("router", ["jquery"], function($) {
    "use strict";

    /**
     * Router routes urls to their controllers
     */

    var Coccyx = window.Coccyx = window.Coccyx || {};

    function route(verb, url, valuesHash){
        var rt = getRoute(verb, url);
        if(rt){
            routeFound(rt, valuesHash);
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

    function routeFound(route, valuesHash){
        // Route callbacks are bound (their contexts (their 'this')) to their controllers.
        if(valuesHash){
            route.fn.call(Coccyx.controllers.getController(route.controllerName), valuesHash);
        }else if(route.params.length){
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
        if(Coccyx.history.started()){
            options = options || {};
            options.state = options.state || null;
            options.title = options.title || document.title;
            options.method = options.method || "get";
            options.url = options.url || window.location.pathname;
            options.trigger = options.trigger || false;
            options.replace = options.replace || false;
            window.history[options.replace ? "replaceState" : "pushState"](options.state, options.title, options.url);
            if(options.trigger){
                route(options.method, options.url);
            }
        }
    }

    Coccyx.router = {
        route: route,
        navigate: navigate
    };

});

;define("views", ["jquery"], function($){
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
        console.log("Registering view '" + view.name + "'");
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
        console.log("views::viewNotFound called with view name = " + name);
    }

    Coccyx.views = {
        registerViews: registerViews,
        render: render,
        remove: remove
    };

});

;define("pubsub", [], function(){
    /**
     * A purely hash-based pubsub implementation.
     */
    "use strict";

    var Coccyx = window.Coccyx = window.Coccyx || {},
        subscribers = {},
        lastToken = 0;

    /*
        subscribers is a hash of hashes
        {
            "some topic": {
                "some token": callbackfunction,
                "some token": callbackfunction,
                . etc.
            },
            . etc
        }
    */

    function generateToken(){
        var token;
        while(true){
            token = Date.now().valueOf();
            if(token !== lastToken){
                lastToken = token;
                return token;
            }
        }
    }

    function subscribe(topic, handler){
        var token = generateToken();

        if(!subscribers.hasOwnProperty(topic)){
            subscribers[topic] = {};
        }
        subscribers[topic][token] = handler;
        return token;
    }

    function unsubscribe(topic, token){
        if(subscribers.hasOwnProperty(topic)){
            if(subscribers[topic].hasOwnProperty(token)){
                delete subscribers[topic][token];
            }
        }
    }

    function publish(topic, data){
        var token;
        if(subscribers.hasOwnProperty(topic)){
            for(token in subscribers[topic] ){
                if(subscribers[topic].hasOwnProperty(token)){
                    if(data){
                        subscribers[topic][token](data);
                    }else{
                        subscribers[topic][token]();
                    }
                }
            }
        }
    }

    Coccyx.pubsub = {
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        publish: publish
    };

});

;define("coccyx", ["application", "helpers", "history", "models", "router", "views", "pubsub"], function () {
    "use strict";
    return window.Coccyx;
});
