// Coccyx.js 0.6.0
// (c) 2013 Jeffrey Schwartz
// Coccyx.js may be freely distributed under the MIT license.
// For all details and documentation:
// http://coccyxjs.jitsu.com
;define('application', ['jquery'], function($){
    'use strict';

    var Coccyx = window.Coccyx = window.Coccyx || {},
        controllers = {},
        routes = {},
        version;

    /**
     * Controller
     * {name: root} - the root refers to the 1st segment of the pathname of the url
     * so if the pathanme of the url is '/controller/noun' then root = controller.
     */

     function registerControllers(){
        if(arguments.length !== 1 && !(arguments[0] instanceof Array) && !(arguments[0] instanceof Object)){
            // TODO Not sure if I should be throwing here. Think about it!!!
            console.log('registerControllers missing or invalid param. Expected an [] or {}.');
        }
        if(arguments[0] instanceof Array){
            // An array of hashes.
            arguments[0].forEach(function(controller){
                loadRoutesFromController(controller);
                wireEvents(controller);//0.6.0
                callInit(controller); //0.4.0
            });
        }else{
            // A single hash.
            loadRoutesFromController(arguments[0]);
            wireEvents(arguments[0]);//0.6.0
            callInit(arguments[0]); //0.4.0
        }
    }

    //0.6.0 Auto wires controller events.
    function wireEvents(controller){
        //0.6.0 Wires controller to receive model property changed
        //events if the controller defines a function called
        //modelPropertyChangedEventHandler. The function will be called
        //using the context of the controller in which it is defined.
        //The token id returned from calling Coccyx.pubsub.subscribe()
        //is saved as a property of the callback function and is named
        //modelPropertyChangedEventHandlerTokenId.
        if(controller.modelPropertyChangedEventHandler){
            controller.modelPropertyChangedEventHandler.modelPropertyChangedEventHandlerTokenId =
                Coccyx.pubsub.subscribe(Coccyx.models.propertyChangedEventTopic,
                    controller.modelPropertyChangedEventHandler,
                    {context: controller});
        }
    }

    function loadRoutesFromController(controller){
        var namedRoute;
        console.log('Registering controller \'' + controller.name + '\'');
        // controller's local $
        controller.$ = $;
        // Maintain list of controllers for when we need to bind them to route function callbacks.
        controllers[controller.name] = controller;
        // Build the routes array.
        for(var route in controller.routes){
            if(controller.routes.hasOwnProperty(route)){
                // Verb + ' /'.
                namedRoute = route.substring(0, route.indexOf(' ') + 1) + '/';
                // Controller name (the root segment).
                namedRoute += controller.name;
                // Remaining path.
                namedRoute += (route.substring(route.indexOf(' ') + 1) === '/' ?
                    '' : controller.name === '' ? route.substring(route.indexOf(' ') + 1) :
                    '/' + route.substring(route.indexOf(' ') + 1));
                routes[namedRoute] = [controller.name,controller.routes[route]];
                console.log('Registering route \'' + namedRoute + '\'');
            }
        }
    }

    // 0.4.0
    function callInit(controller){
        // init is optional so check if the controller has it first!
        if(controller.hasOwnProperty('init')){
           controller.init();
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

    // Version stamp
    version = '0.6.0';
    Coccyx.getVersion = function(){
        return version;
    };

    // Define what a controller is.
    Coccyx.controllers = {
        registerControllers : registerControllers,
        getRoutes: getRoutes,
        getController: getController
    };

});

;define('helpers', [], function(){
    'use strict';

    var Coccyx = window.Coccyx = window.Coccyx || {};

    Coccyx.helpers = {
        // Returns true if s1 contains s2, otherwise returns false.
        contains: function(s1, s2){
            var i, len;
            if(typeof s1 === 'string'){
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
        },
        //For each matching property name, replaces
        //target's value with source's value.
        replace: function(target, source){
            for(var prop in target){
                if(target.hasOwnProperty(prop) && source.hasOwnProperty(prop)){
                    target[prop] = source[prop];
                }
            }
        }
    };

});

;define('history', ['jquery', 'router'], function($) {
    'use strict';

    // Verify browser supports pushstate.
    if(!history.pushState){
        console.log('history pushstate is not supported in your browser');
        throw new Error('history pushstate not supported');
    }
    console.log('history pushState is supported in your browser');

    // The 'one' global variable.
    var Coccyx = window.Coccyx = window.Coccyx || {},
        historyStarted = false;

    // Event handler for click event on anchor tags. Ignores those
    // where the href path doesn't start with a '/' character. This
    // prevents handling external links, allowing those events
    // to bubble up as normal.
    $(document).on('click', 'a', function(event){
        if($(this).attr('href').indexOf('/') === 0){
            event.preventDefault();
            var pathName = event.target.pathname;
            // console.log('The url's path = ', ''' + pathName+''');
            // console.log(event);
            // The 'verb' for routes on anchors is always 'get'.
            Coccyx.router.route('get', pathName);
            history.pushState({verb: 'get'}, null, event.target.href);
        }
    });

    // TODO Needs to be implemnted, an event handler for forms.
    // 'Verb' should be set to whatever the form's 'method' attribute
    // is set to. If 'method' attribute doesn' exist, then 'verb'
    // defaults to get.
    $(document).on('submit', 'form', function(event){
        var $form = $(this),
            action = $form.attr('action'),
            method,
            valuesHash;
        console.log(event);
        if(action.indexOf('/') === 0){
            event.preventDefault();
            method = $form.attr('method');
            valuesHash = valuesHashFromSerializedArray($form.serializeArray());
            Coccyx.router.route(method, action, valuesHash);
        }
    });

    // Event handler for popstate event.
    $(window).on('popstate', function(event){
        // Ignore 'popstate' events without state and until history.start is called.
        if(event.originalEvent.state && started()){
            Coccyx.router.route(event.originalEvent.state.verb , window.location.pathname);
        }
    });

    // Creates a hash from an array whose elements are hashes whose properties are 'name' and 'value'.
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

    // Call Coccyx.history.start to start your application.
    // When called starts responding to 'popstate' events which are raised when the
    // user uses the browser's back and forward buttons to navigate. Pass true for
    // trigger if you want the route function to be called.
    // 0.5.0
    function start(trigger, controllers){
        Coccyx.controllers.registerControllers(controllers); // 0.5.0
        historyStarted = true;
        if(trigger){
            history.replaceState({verb: 'get'}, null, window.location.pathname);
            Coccyx.router.route('get', window.location.pathname);
        }
    }

    // A wrapper for the browser's history.pushState and history.replaceState.
    // Whenever you reach a point in your application that you'd like to save as a URL,
    // call navigate in order to update the URL. If you wish to also call the route function,
    // set the trigger option to true. To update the URL without creating an entry in the
    // browser's history, set the replace option to true.
    // Pass true for trigger if you want the route function to be called.
    // Pass true for replace if you only want to replace the current history entry and not
    // push a new one onto the browser's history stack.
    // function navigate(state, title, url, trigger, replace){
    function navigate(options){
        if(Coccyx.history.started()){
            options = options || {};
            options.state = options.state || null;
            options.title = options.title || document.title;
            options.method = options.method || 'get';
            options.url = options.url || window.location.pathname;
            options.trigger = options.trigger || false;
            options.replace = options.replace || false;
            window.history[options.replace ? 'replaceState' : 'pushState'](options.state, options.title, options.url);
            if(options.trigger){
                Coccyx.router.route(options.method, options.url);
            }
        }
    }

    Coccyx.history = {
        start: start,
        started: started,
        navigate: navigate
    };

});

;define('models', [], function(){
    'use strict';

    //TODO: rename set and get Property to something else!

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
        deepCopy = Coccyx.helpers.deepCopy,
        modelPropertyChangedEventTopic = 'MODEL_PROPERTY_CHANGED_EVENT',
        proto;

    //0.6.0
    //Publishes MODEL_PROPERTY_CHAGED_EVENT event via Coccyx.pubsub.
    function publishPropertyChangeEvent(model, propertyPath, value){
        Coccyx.pubsub.publish(modelPropertyChangedEventTopic, {propertyPath: propertyPath, value: value, model: model});
    }

    //0.6.0
    //Return the property reachable through the property path or undefined.
    function findProperty(obj, propertyPath){
        //0.6.0
        //Return false if obj is an array or not an object.
        if(Array.isArray(obj) || typeof obj !== 'object'){
            return;
        }
        var a = propertyPath.split('.');
        if(a.length === 1){
            return obj[propertyPath];
        }
        //Try the next one in the chain.
        return findProperty(obj[a[0]], a.slice(1).join('.'));
    }

    //0.6.0
    //Sets the property reachable through the property path, creating it first if necessary, with a deep copy of val.
    function findAndSetProperty(obj, propertyPath, val){
        var a = propertyPath.split('.');
        if(a.length === 1){
            obj[propertyPath] = typeof val === 'object' ? deepCopy(val) : val;
        }else{
            if(!obj.hasOwnProperty(a[0])){
                obj[a[0]] = {};
            }
            findAndSetProperty(obj[a[0]], a.slice(1).join('.'), val);
        }
    }

    //0.5.0
    function extend(modelObject){
        // Create a new object using proto as its prototype and
        // extend that object with modelObject if it was supplied.
        var obj1 =  modelObject ? Coccyx.helpers.extend(Object.create(proto), modelObject) : proto;
        var obj2 = Object.create(obj1);
        // Decorate the new object with additional properties.
        obj2.isSet = false;
        obj2.isReadOnly = false;
        obj2.isDirty = false;
        obj2.originalData = {};
        obj2.changedData = {};
        obj2.data = {};
        return obj2;
    }

    // model prototype properties...
    proto = {
        setData: function setData (dataHash, options) {
            var o = {empty:false, readOnly:false, dirty:false, validate: false};
                // ,prop;
            // Merge default options with passed in options.
            if(options){
                Coccyx.helpers.replace(o, options);
            }
            // If options validate is true and there is a validate method and
            // it returns false, sets valid to false and returns false.
            // If options validate is true and there is a validate method and
            // it returns true, sets valid to true and proceeds with setting data.
            // If options validate is false or there isn't a validate method
            // set valid to true.
            this.isValid = o.validate && this.validate ? this.validate(dataHash) : true;
            if(!this.isValid){
                return false;
            }
            // Deep copy.
            this.originalData = o.empty ? {} : deepCopy(dataHash);
            this.isReadOnly = o.readOnly;
            this.isDirty = o.dirty;
            // Deep copy.
            this.data = deepCopy(dataHash);
            this.changedData = {};
            this.isSet = true;
            return true;
        },
        getData: function getData(){
            return deepCopy(this.data);
        },
        // Returns deep copy of originalData
        getOriginalData: function getOriginalData(){
            return deepCopy(this.originalData);
        },
        // Returns deep copy of changedData
        getChangedData: function getChangedData(){
            return deepCopy(this.changedData);
        },
        // Returns the data property reachable through property path. If
        // there is no property reachable through property path
        // return undefined.
        getProperty: function getProperty(propertyPath){
            var v = findProperty(this.data, propertyPath);
            return typeof v === 'object' ? deepCopy(v) : v;
        },
        // Returns the originalData property reachable through property path. If
        // there is no property reachable through property path
        // return undefined.
        getOriginalDataProperty: function getProperty(propertyPath){
            var v = findProperty(this.originalData, propertyPath);
            return typeof v === 'object' ? deepCopy(v) : v;
        },
        // Returns the changedData property reachable through property path. If
        // there is no property reachable through property path
        // return undefined.
        getChangedDataProperty: function getProperty(propertyPath){
            var v = findProperty(this.changedData, propertyPath);
            return typeof v === 'object' ? deepCopy(v) : v;
        },
        //Sets a property on an object reachable through the property path.
        //If the property doesn't exits, it will be created and then assigned
        //its value (using a deep copy if typeof data === 'object'). Calling
        //set with a nested object or property is therefore supported. For
        //example, if the property path is address.street and the model's data
        // hash is {name: 'some name'}, the result will be
        //{name: 'some name', address: {street: 'some street'}}; and the changed
        //data hash will be {'address.street': some.street'}.
        setProperty: function setProperty(propertyPath, val){
            // A model's data properties cannot be written to if the model
            // hasn't been set yet or if the model is read only.
            if(this.isSet){
                if(!this.isReadOnly){
                    findAndSetProperty(this.data, propertyPath, val);
                    this.changedData[propertyPath] = deepCopy(val);
                    this.isDirty = true;
                    //0.6.0
                    //Named models publish change events.
                    if(this.modelName){
                        publishPropertyChangeEvent(this, propertyPath, val);
                    }
                }else{
                    console.log('Warning! Coccyx.model::setProperty called on read only model.');
                }
            }else{
                console.log('Warning! Coccyx.model::setProperty called on model before model::set was called.');
            }
            // For chaining.
            return this;
       },
       //0.6.0
       //Returns stringified model's data hash.
       toJSON: function(){
            return JSON.stringify(this.data);
       },
       //0.6.0
       //Returns this model's name. A model's name along with when publishing model state change events.
       //
       getModelName: function(){
            return this.modelName;
       }
    };

    Coccyx.models = {
        extend: extend,
        propertyChangedEventTopic: modelPropertyChangedEventTopic
    };

});

;define('collections', [], function(){
    'use strict';

//TODO go through all comments. Insure they are relevant and insightful.
    var Coccyx = window.Coccyx = window.Coccyx || {},
        proto;

    //Extend the application's collection object.
    function extend(collectionObject){
        // Create a new object using proto as its prototype and extend
        // that object with collectionObject if it was supplied.
        var obj1 = collectionObject ? Coccyx.helpers.extend(Object.create(proto), collectionObject) : proto;
        var obj2 = Object.create(obj1);
        obj2.isReadOnly = false;
        obj2.coll = [];
        obj2.length = 0;
        return obj2;
    }

    //Returns an array containing the raw
    //data for each model in the models array.
    function toRaw(models){
        if(Array.isArray(models)){
            return models.map(function(model){
                return model.getData();
            });
        }
    }

    function compareArrays(a, b){
        var i,
            len;
        if(Array.isArray(a) && Array.isArray(b)){
            if(a.length !== b.length){
                return false;
            }
            for(i = 0, len = a.length; i < len; i++){
                if(typeof a[i] === 'object' && typeof b[i] === 'object'){
                    if(!compareObjects(a[i], b[i])){
                        return false;
                    }
                    continue;
                }
                if(typeof a[i] === 'object' || typeof b[i] === 'object'){
                    return false;
                }
                if(Array.isArray(a[i]) && Array.isArray(b[i])){
                    if(!compareArrays(a[i], b[i])){
                        return false;
                    }
                    continue;
                }
                if(Array.isArray(a[i]) || Array.isArray(b[i])){
                    return false;
                }
                if(a[i] !== b[i]){
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    function compareObjects(a, b){
        var prop;
        if(compareArrays(a, b)){
            return true;
        }
        for(prop in a){
            if(a.hasOwnProperty(prop) && b.hasOwnProperty(prop)){
                if(typeof a[prop] === 'object' && typeof b[prop] === 'object'){
                    if(!compareObjects(a[prop], b[prop])){
                        return false;
                    }
                    continue;
                }
                if(typeof a[prop] === 'object' || typeof b[prop] === 'object'){
                    return false;
                }
                if(a[prop] !== b[prop]){
                    return false;
                }
            }else {
                return false;
            }
        }
        return true;
    }

    function compare(a, b){
        return compareObjects(a, b) && compareObjects(b, a);
    }

    //Returns true if element has the same properties as
    //source and their values are equal, false otherwise.
    function isMatch(element, source){
        var prop;
        for(prop in source){
            if(source.hasOwnProperty(prop) && element.hasOwnProperty(prop)){
                if(typeof element[prop] === 'object' && typeof source[prop] === 'object'){
                    if(!compare(element[prop], source[prop])){
                        return false;
                    }
                    // //!Recursive iteration...
                    // if(!isMatch(element[prop], source[prop])){
                    //     return false;
                    // }
                }else if(typeof element[prop] === 'object' || typeof source[prop] === 'object'){
                    return false;
                }else{
                    if(source[prop] !== element[prop]){
                        return false;
                    }
                }
            }else{
                return false;
            }
        }
        return true;
    }

    function isArrayOrNotObject(value){
        return Array.isArray(value) || typeof value !== 'object' ? true : false;
    }

    //If it walks and talks like a duck...
    //Checks for the following properties on a model's data:
    //['isSet']
    //['isReadOnly']
    //['isDirty]
    //['originalData']
    //['changedData']
    //['data']
    //If data has all of them then 'it is' a model
    //and returns true, otherwise it returns false.
    function isAModel(data){
        var markers = ['isSet', 'isReadOnly', 'isDirty', 'originalData', 'changedData', 'data'],
            i,
            len;
        for(i = 0, len = markers.length; i < len; i++){
            if(!data.hasOwnProperty(markers[i])){
                return false;
            }
        }
        return true;
    }

    //Makes a model from raw data and returns that model.
    function makeModelFromRaw(raw){
        var model = Coccyx.models.extend();
        model.setData(raw);
        return model;
    }

    //A simple general use, recursive iterator. Makes no
    //assumptions about what args is. Args could be
    //anything - a function's arguments, an Array, an
    //object or even a primitive.
    function iterate(args, callback){
        var i,
            len;
        //If args is an Array or it has a length property it is iterable.
        if(Array.isArray(args) || args.hasOwnProperty('length')){
            for(i = 0, len = args.length; i < len; i++){
                iterate(args[i], callback);
            }
        }else{
            //Not iterabe.
            callback(args);
        }
    }

    //Pushes [models] onto the collection. [models] can
    //be either models or raw data. If [models] is raw data,
    //the raw data will be turned into models first before
    //being pushed into the collection.
    function addModels(coll, models){
        if(Array.isArray(models)){
            models.forEach(function(model){
                coll.push(isAModel(model) ? model : makeModelFromRaw(model));
            });
        }else{
            coll.push(isAModel(models) ? models : makeModelFromRaw(models));
        }
    }

    //Calls iterate on args to generate and array of models.
    function argsToModels(args){
        var models = [];
        iterate(args, function(arg){
            models.push(isAModel(arg) ? arg : makeModelFromRaw(arg));
        });
        return models;
    }

    //Collection prototype properties...
    proto = {
        /* Mutators */

        //Sets the collection's data property to [models].
        setModels: function setModels(models, options){
            this.coll = [];
            addModels(this.coll, models);
            this.isReadOnly = options && options.readOnly;
            this.length = this.coll.length;
            return this;
        },
        //Pops the last model from the collection's
        //data property and returns that model.
        pop: function pop(){
            var m = this.coll.pop();
            this.length = this.coll.length;
            return m;
        },
        //Push [models] onto the collection' data property
        //and returns the length of the collection.
        push: function push(models){
            addModels(this.coll, models);
            this.length = this.coll.length;
            return this.length;
        },
        reverse: function reverse(){
            this.coll.reverse();
        },
        shift: function shift(){
            var m = this.coll.shift();
            this.length = this.coll.length;
            return m;
        },
        //Works the same as Array.sort(function(a,b){...})
        sort: function sort(callback){
            this.coll.sort(function(a, b){
                return callback(a, b);
            });
        },
        //Adds and optionally removes models. Takes new
        //[modlels] starting with the 3rd parameter.
        splice: function splice(index, howMany){
            var a =[index, howMany],
                aa = argsToModels([].slice.call(arguments, 2));
            a = a.concat(aa);
            var m = [].splice.apply(this.coll, a);
            this.length = this.coll.length;
            return m;
        },
        //Adds one or more models to the beginning of an array and returns
        //the new length of the array. If raw data is passed instead of
        //models, they will be converted to models first, and then added
        //to the collection.
        unshift: function unshift(){
            var m = [].unshift.apply(this.coll, argsToModels(arguments));
            this.length = this.coll.length;
            return m;
        },

        /* Accessors */

        //Returns an array of the deep copied data of all models in the collection
        getData: function(){
            return this.map(function(model){
                return model.getData();
            });
        },
        //Works like array[i].
        at: function(index){
            return this.coll[index];
        },
        //Note sure if concat makes sense on its own. Maybe provide
        //a higher level method to create a new collection using
        //this collection's models and additional models/raw data???
        // //Returns a new array comprised of this collection's models
        // //joined with other array(s) of models or array(s) of raw data.
        // //It does not alter the collection.
        // concat: function(){
        //     return [].concat.apply(this.coll, argsToModels(arguments));
        // },
        //Returns a copy of a portion of the models in the collection.
        slice: function(){
            return [].slice.apply(this.coll, arguments).map(function(model){
                return makeModelFromRaw(model.getData());
            });
        },

        /* Iterators */

        //Invokes a callback function for each model in the
        //collection with three arguments: the model, the model's
        //index, and the collection object's coll. If supplied,
        //the second parameter will be used as the context for
        //the callback.
        forEach: function forEach(/*callback, context*/){
            [].forEach.apply(this.coll, [].slice.call(arguments, 0));
        },
        //Tests whether all models in the collection pass the
        //test implemented by the provided callback.
        every: function every(/*callback, context*/){
            return [].every.apply(this.coll, [].slice.call(arguments, 0));
        },
        //Tests whether some model in the collection passes the
        //test implemented by the provided callback.
        some: function(/*callback, context*/){
            return [].some.apply(this.coll, [].slice.call(arguments, 0));
        },
        //Returns an array containing all the models that pass
        //the test implemented by the provided callback.
        filter: function(/*callback, context*/){
            return [].filter.apply(this.coll, [].slice.call(arguments, 0));
        },
        //Creates a new array with the results of calling a
        //provided function on every model in the collection.
        map: function(/*callback, context*/){
            return [].map.apply(this.coll, [].slice.call(arguments, 0));
        },

        /* Sugar */

        //Sets the readOnly flag on all models
        //in the collection to isReadOnly.
        setReadOnly: function setReadOnly(readOnly){
            this.coll.forEach(function(model){
               model.isReadOnly = readOnly;
            });
            this.isReadOnly = readOnly;
        },
        //Removes all models from the collection whose data
        //properties matches those of matchingPropertiesHash.
        remove: function remove(matchingPropertiesHash){
            var newColl;
            if(isArrayOrNotObject(matchingPropertiesHash)){
                return;
            }
            newColl = this.coll.filter(function(el){
                return !isMatch(el.data, matchingPropertiesHash);
            });
            this.coll = newColl.length !== this.coll.length ? newColl : this.coll;
            this.length = this.coll.length;
        },
        //Returns true if the coll has at least one model whose
        //data properties matches those of matchingPropertiesHash.
        has: function has(matchingPropertiesHash){
            if(isArrayOrNotObject(matchingPropertiesHash)){
                return false;
            }
            return this.coll.some(function(el){
                return isMatch(el.data, matchingPropertiesHash);
            });
        },
        //Returns an array whose elements contain the stringified value
        //of their model's data.
        find: function find(matchingPropertiesHash){
            if(isArrayOrNotObject(matchingPropertiesHash)){
                return null;
            }
            return this.coll.filter(function(el){
                return isMatch(el.data, matchingPropertiesHash);
            });
        },
        //Stringifies all models data and returns them in an array.
        toJSON: function toJSON(){
            return  this.coll.map(function(el){
                return JSON.stringify(el.getData());
            });
        },
        //Same as Coccyx.collections.toRaw(models).
        //See above for details.
        toRaw: toRaw
    };

    Coccyx.collections = {
        extend: extend,
        toRaw: toRaw
    };

});

;define('router', ['jquery'], function($) {
    'use strict';

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
            a = url.substring(1).split('/'),
            route,
            b,
            c,
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
                // Get the 'veb'.
                v = route.substring(0, route.indexOf(' '));
                // Get the url.
                b = route.substring(route.indexOf('/') + 1).split('/');
                if(verb === v && (a.length === b.length || Coccyx.helpers.contains(route, '*'))){
                    eq = true;
                    // The url and the route have the same number of segments so the route
                    // can be either static or it could contain parameterized segments.
                    for(i = 0, len = b.length; i < len; i++){
                        // If the segments are equal then continue looping.
                        if(a[i] === b[i]){
                            continue;
                        }
                        // If the route segment is parameterized then save the parameter and continue looping.
                        if(Coccyx.helpers.contains(b[i],':')){
                            // 0.4.0 - checking for 'some:thing'
                            c = b[i].split(':');
                            if(c.length === 2){
                                if(a[i].substr(0, c[0].length) === c[0]){
                                    params.push(a[i].substr(c[0].length));
                                }
                            }else{
                                params.push(a[i]);
                            }
                            continue;
                        }
                        // If the route is a relative route, push it onto the array and break out of the loop.
                        if(Coccyx.helpers.contains(b[i], '*')){
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
                        for(ii = i, relUrl = ''; ii < a.length; ii++){
                            relUrl += ('/' + a[ii]);
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
        console.log('router::routeNotFound called with route = ' + url);
        // Show a Coccyx 404 error.
        $('body').html('<div style="font-size:68px;"><p style="margin:auto !important;line-height:80px;">Coccyx 404</p><p style="margin:auto !important;line-height:80px;">' + url + ' Not Found.</p><p style="margin:auto !important;line-height:80px;"> Did you forget to call Coccyx.controllers.registerController to register your controller?</p></div>');
    }

    Coccyx.router = {
        route: route
    };

});

;define('views', ['jquery'], function($){
    'use strict';

    var Coccyx = window.Coccyx = window.Coccyx || {};

    //0.5.0
    function extend(viewObject){
        // Create a new object using the view object as its prototype.
        var obj =  Object.create(viewObject);
        // Decorate the new object with additional properties.
        obj.$ = $;
        return obj;
    }

    Coccyx.views = {
        extend: extend
    };

});

;define('pubsub', [], function(){
    /**
     * A purely hash-based backed pubsub implementation.
     */
    'use strict';

    var Coccyx = window.Coccyx = window.Coccyx || {},
        subscribers = {},
        totalSubscribers = 0,
        lastToken = 0;

    /* subscribers is a hash of hashes {'some topic': {'some token': callbackfunction, 'some token': callbackfunction, . etc. }, . etc } */

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

    //0.6.0 Returns a function which wraps
    //subscribers callback in a setTimeout callback.
    function genAsyncCallback(topic, callback){
        return function(topic, data){
            setTimeout(function(){
                callback(topic, data);
            }, 1);
        };
    }

    //0.6.0 added async callback. if options.async is false
    //then the callback will be done synchronously.
    //0.6.0 options hash as optional 3rd argument.
    function subscribe(topic, handler/*, options*/){
        var token = generateToken();
        var defaultOptions = {context: null, async: true};
        var options = arguments.length === 3 ? Coccyx.helpers.extend({}, defaultOptions, arguments[2]) : defaultOptions;
        var callback = options.context ? handler.bind(options.context) : handler;
        callback = options.async ? genAsyncCallback(topic, callback) : callback;
        if(!subscribers.hasOwnProperty(topic)){
            subscribers[topic] = {};
        }
        subscribers[topic][token] = callback;
        totalSubscribers++;
        return token;
    }

    function unsubscribe(topic, token){
        if(subscribers.hasOwnProperty(topic)){
            if(subscribers[topic].hasOwnProperty(token)){
                delete subscribers[topic][token];
                totalSubscribers--;
            }
        }
    }

    function publish(topic, data){
        var token;
        if(subscribers.hasOwnProperty(topic)){
            for(token in subscribers[topic] ){
                if(subscribers[topic].hasOwnProperty(token)){
                    if(data){
                        subscribers[topic][token](topic, data);
                    }else{
                        subscribers[topic][token](topic);
                    }
                }
            }
        }
    }

    //0.6.0 Might be useful to have for testing.
    function getCountOfSubscribers(){
        return totalSubscribers;
    }

    //0.6.0 Might be useful to have for testing.
    function getCountOfSubscribersByTopic(topic){
        var prop,
            count = 0;
        if(subscribers.hasOwnProperty(topic)){
            for(prop in subscribers[topic]){
                if(subscribers[topic].hasOwnProperty(prop)){
                    count++;
                }
            }
        }
        return count;
    }

    Coccyx.pubsub = {
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        publish: publish,
        getCountOfSubscribers: getCountOfSubscribers,
        getCountOfSubscribersByTopic: getCountOfSubscribersByTopic
    };

});

;define('coccyx', ['application', 'helpers', 'history', 'models', 'collections', 'router', 'views', 'pubsub'], function () {
    'use strict';
    return window.Coccyx;
});
