//Coccyx.js 0.6.2
//(c) 2013 Jeffrey Schwartz
//Coccyx.js may be freely distributed under the MIT license.
//For all details and documentation:
//http://coccyxjs.jitsu.com
(function(){
    'use strict';
    if(!(typeof define  === 'function' && define.amd)) {
        window.define =  function define(){
            (arguments[arguments.length - 1])();
        };
    }
}());

define('application', ['jquery'], function(){
    'use strict';

    var v = window.Coccyx = window.Coccyx || {},
        controllers = {},
        routes = {},
        VERSION = '0.6.2';

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
        controller.$ = v.$;
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
    v.$ = jQuery;

    //0.6.0 Renamed userspace to application - provides a bucket for application stuff.
    v.application = v.application || {};

    //0.6.1 init will be called only once immediately before the first routing request
    //is handled by the router. Override init to provide application specific initialization,
    //such as bootstrapping your application with data.
    v.init = function init(){};

    //Provide a bucket for Coccyx library plug-ins.
    v.plugins = v.plugins || {};

    //Version stamp.
    v.getVersion = function(){
        return VERSION;
    };

    v.controllers = {registerControllers : registerControllers, getRoutes: getRoutes, getController: getController};

});

define('helpers', [], function(){
    'use strict';

    var v = window.Coccyx = window.Coccyx || {};

    v.helpers = {
        //Returns true if s1 contains s2, otherwise returns false.
        contains: function contains(s1, s2){
            if(typeof s1 === 'string'){
                for(var i = 0, len = s1.length; i < len; i++){
                    if(s1[i] === s2) {
                        return true;
                    }
                }
            }
            return false;
        },
        //Returns a deep copy object o.
        deepCopy: function deepCopy(o){
            return JSON.parse(JSON.stringify(o));
        },
        //Pass one or more objects as the source objects whose properties are to be copied to the target object.
        extend: function extend(targetObj){
            var property;
            for(var i = 1, len = arguments.length - 1; i <= len; i++){
                for(property in arguments[i]){
                    if(arguments[i].hasOwnProperty(property)){
                        targetObj[property] = arguments[i][property];
                    }
                }
            }
            return targetObj;
        },
        //For each matching property name, replaces target's value with source's value.
        replace: function replace(target, source){
            for(var prop in target){
                if(target.hasOwnProperty(prop) && source.hasOwnProperty(prop)){
                    target[prop] = source[prop];
                }
            }
            //0.6.0 Return target.
            return target;
        }
    };

});

define('history', ['application', 'router'], function() {
    'use strict';

    //Verify browser supports pushstate.
    console.log(history.pushState ? 'history pushState is supported in your browser' :
        'history pushstate is not supported in your browser');

    var v = window.Coccyx = window.Coccyx || {},
        historyStarted = false;

    //Event handler for click event on anchor tags. Ignores those where the href path doesn't start with
    //a '/' character; this prevents handling external links, allowing those events  to bubble up as normal.
    v.$(document).on('click', 'a', function(event){
        if(v.$(this).attr('href').indexOf('/') === 0){
            event.preventDefault();
            //0.6.0 changed target to currentTarget.
            var pathName = event.currentTarget.pathname;
            //The 'verb' for routes on anchors is always 'get'.
            v.router.route('get', pathName);
            //0.6.0 changed target to currentTarget.
            history.pushState({verb: 'get'}, null, event.currentTarget.href);
        }
    });

    //Event handler for form submit event. Ignores submit events on forms whose action attributes do not
    //start with a '/' character; this prevents handling form submit events for forms whose action
    //attribute values are external links, allowing those events  to bubble up as normal.
    v.$(document).on('submit', 'form', function(event){
        var $form = v.$(this),
            action = $form.attr('action'),
            method = $form.attr('method'),
            valuesHash;
        if(action.indexOf('/') === 0){
            event.preventDefault();
            method = method ? method : 'get';
            valuesHash = valuesHashFromSerializedArray($form.serializeArray());
            v.router.route(method, action, valuesHash);
        }
    });

    //Event handler for popstate event.
    v.$(window).on('popstate', function(event){
        //Ignore 'popstate' events without state and until history.start is called.
        if(event.originalEvent.state && started()){
            v.router.route(event.originalEvent.state.verb , window.location.pathname);
        }
    });

    //Creates a hash from an array whose elements are hashes whose properties are 'name' and 'value'.
    function valuesHashFromSerializedArray(valuesArray){
        var valuesHash = {};
        for(var i = 0, len = valuesArray.length; i < len; i++){
            valuesHash[valuesArray[i].name] = valuesArray[i].value;
        }
        return valuesHash;
    }

    function started(){
        return historyStarted;
    }

    //Call Coccyx.history.start to start your application. When called starts responding to
    //'popstate' events which are raised when the user uses the browser's back and forward
    //buttons to navigate. Pass true for trigger if you want the route function to be called.
    //0.5.0
    function start(trigger, controllers){
        v.controllers.registerControllers(controllers); //0.5.0
        historyStarted = true;
        history.replaceState({verb: 'get'}, null, window.location.pathname);
        if(trigger){
            v.router.route('get', window.location.pathname);
        }
    }

    //A wrapper for the browser's history.pushState and history.replaceState. Whenever you reach
    //a point in your application that you'd like to save as a URL, call navigate in order to update
    //the URL. If you wish to also call the route function, set the trigger option to true. To update
    //the URL without creating an entry in the browser's history, set the replace option to true.
    //Pass true for trigger if you want the route function to be called.
    //Pass true for replace if you only want to replace the current history entry and not
    //push a new one onto the browser's history stack.
    //function navigate(state, title, url, trigger, replace){
    function navigate(options){
        if(v.history.started()){
            options = options || {};
            options.state = options.state || null;
            options.title = options.title || document.title;
            options.method = options.method || 'get';
            options.url = options.url || window.location.pathname;
            options.trigger = options.trigger || false;
            options.replace = options.replace || false;
            window.history[options.replace ? 'replaceState' : 'pushState'](options.state, options.title, options.url);
            if(options.trigger){
                v.router.route(options.method, options.url);
            }
        }
    }

    v.history = {start: start, started: started, navigate: navigate};
});

define('models', ['application', 'helpers', 'ajax', 'eventer'], function(){
    'use strict';

    /**
     * Warning!!!! Don't use primitive object wrappers, Date objects or functions as data property values.
     * This is because model uses JSON.parse(JSON.stringify(data)) to perform a deep copy of your model
     * data and JSON doesn't support primitive object wrappers, Date objects or functions.
     * (see https://developer.mozilla.org/en-US/docs/JSON for details)
     * Deep copying is necessary to isolate the originalValues and changedValues from
     * changes made in data. If you don't heed this warning bad things _will_ happen!!!
     */

    var v = window.Coccyx = window.Coccyx || {},
        deepCopy = v.helpers.deepCopy,
        ext = v.helpers.extend,
        replace = v.helpers.replace,
        propertyChangedEvent = 'MODEL_PROPERTY_CHANGED_EVENT',
        syntheticId = -1, //0.6.0 Generates synthetic model ids.
        proto;

    //0.6.0 Publishes MODEL_PROPERTY_CHAGED_EVENT event via Coccyx.eventer.
    function publishPropertyChangeEvent(model, propertyPath, value){
        //0.6.3 added isSilent check.
        if(!model.getIsSilent()){
            model.trigger(propertyChangedEvent, {propertyPath: propertyPath, value: value, model: model});
        }
    }

    //0.6.0 Return the property reachable through the property path or undefined.
    function findProperty(obj, propertyPath){
        //0.6.0 Return false if obj is an array or not an object.
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

    //0.6.0 Sets the property reachable through the property path, creating it first if necessary, with a deep copy of val.
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

    //0.6.0 Deletes the property reachable through the property path.
    function findAndDeleteProperty(obj, propertyPath){
        var a = propertyPath.split('.');
        if(a.length === 1){
            delete obj[propertyPath];
        }else{
            if(!obj.hasOwnProperty(a[0])){
                obj[a[0]] = {};
            }
            findAndDeleteProperty(obj[a[0]], a.slice(1).join('.'));
        }
    }

    //0.5.0
    //0.6.0 Added support for Coccyx.eventer.
    function extend(modelObject){
        var obj0 = Object.create(proto),
            obj1 = modelObject ? ext(obj0, modelObject) : obj0,
            obj2 = modelObject ? Object.create(obj1) : obj1;
        //Decorate the new object with additional properties.
        obj2.isSet = false;
        obj2.isReadOnly = false;
        obj2.isDirty = false;
        //0.6.3 Added isSilent
        obj2.isSilent = false;
        obj2.originalData = {};
        obj2.changedData = {};
        obj2.data = {};
        //0.6.3 Eventer no longer placed on prototype as in prior versions. Its methods are now mixed in with the final object.
        return v.eventer.extend(obj2);
    }

    //0.6.0
    function setAjaxSettings(verb){
        /*jshint validthis:true*/
        var settings = {};
        settings.url = this.endPoint;
        if(verb !== 'post'){
            settings.url += ('/' + this.data[this.idPropertyName]);
        }
        if(verb !== 'get'){
            settings.data = this.getData();
        }
        settings.dataType = this.endPoint.charAt(0) === '/' ? 'json' : 'jsonp';
        return settings;
    }

    //0.6.0
    function setAjaxOptions(options){
        var defOpts = {rawJSON: false},
            opts = options ? options : {};
        return replace(defOpts, opts);
    }

    //0.6.0 Does the heavy lifting
    function ajax(op, opt, fn){
        /*jshint validthis:true*/
        var deferred = v.$.Deferred(),
            self = this,
            opts = setAjaxOptions(opt),
            promise;
        promise = fn(setAjaxSettings.call(this, op));
        promise.done(function(json){
            if(json && !opts.rawJSON){
                //Set this model's data.
                self.setData(ext(self.getData(),json));
            }
            //Call promise.done.
            deferred.resolve(opts.rawJSON ? json : self);
        });
        promise.fail(function(jjqXHR, textStatus, errorThrown){
            //Call promise.fail.
            deferred.reject(jjqXHR, textStatus, errorThrown);
        });
        //Return a promise.
        return deferred.promise();
    }

    //model prototype properties...
    proto = {
        setData: function setData (dataHash, options) {
            var o = {empty:false, readOnly:false, dirty:false, validate: false};
            //Merge default options with passed in options.
            if(options){
                replace(o, options);
            }
            //If options validate is true and there is a validate method and it returns false, sets valid to false and returns false.
            //If options validate is true and there is a validate method and it returns true, sets valid to true and proceeds with setting data.
            //If options validate is false or there isn't a validate method set valid to true.
            this.isValid = o.validate && this.validate ? this.validate(dataHash) : true;
            if(!this.isValid){
                return false;
            }
            //Deep copy.
            this.originalData = o.empty ? {} : deepCopy(dataHash);
            this.isReadOnly = o.readOnly;
            this.isDirty = o.dirty;
            //Deep copy.
            this.data = deepCopy(dataHash);
            //0.6.0 Every model has an idPropetyName whose value is the name of the model's data id property.
            if(typeof this.idPropertyName === 'undefined') {this.idPropertyName = 'id';}
            //0.6.0 Every model has a modelId property, either a synthetic one (see syntheticId, above)
            //or one provided by the model's data and whose property name is this.idPropertyName.
            this.modelId = this.data.hasOwnProperty(this.idPropertyName) ? this.data[this.idPropertyName] : syntheticId--;
            this.changedData = {};
            this.isSet = true;
            return true;
        },
        getData: function getData(){
            return deepCopy(this.data);
        },
        //Returns deep copy of originalData
        getOriginalData: function getOriginalData(){
            return deepCopy(this.originalData);
        },
        //Returns deep copy of changedData
        getChangedData: function getChangedData(){
            return deepCopy(this.changedData);
        },
        //Returns the data property reachable through property path. If there is no property reachable through property path
        //return undefined.
        getProperty: function getProperty(propertyPath){
            var p = findProperty(this.data, propertyPath);
            return typeof p === 'object' ? deepCopy(p) : p;
        },
        //Returns the originalData property reachable through property path. If there is no property reachable through property path
        //return undefined.
        getOriginalDataProperty: function getOriginalDataProperty(propertyPath){
            var p = findProperty(this.originalData, propertyPath);
            return typeof p === 'object' ? deepCopy(p) : p;
        },
        //Returns the changedData property reachable through property path. If there is no property reachable through property path
        //return undefined.
        getChangedDataProperty: function getChangedDataProperty(propertyPath){
            var p = findProperty(this.changedData, propertyPath);
            return typeof p === 'object' ? deepCopy(p) : p;
        },
        //Sets a property on an object reachable through the property path. If the property doesn't exits, it will be created and then assigned
        //its value (using a deep copy if typeof data === 'object'). Calling set with a nested object or property is therefore supported. For
        //example, if the property path is address.street and the model's data hash is {name: 'some name'}, the result will be
        //{name: 'some name', address: {street: 'some street'}}; and the changed data hash will be {'address.street': some.street'}.
        setProperty: function setProperty(propertyPath, val){
            //A model's data properties cannot be written to if the model hasn't been set yet or if the model is read only.
            if(this.isSet && !this.isReadOnly){
                findAndSetProperty(this.data, propertyPath, val);
                this.changedData[propertyPath] = deepCopy(val);
                this.isDirty = true;
                //0.6.0 Maintain id's state when setting properties on data.
                if(this.data.hasOwnProperty(this.idPropertyName)){
                    this.modelId = this.data[this.idPropertyName];
                }
                publishPropertyChangeEvent(this, propertyPath, val);
            }else{
                console.log(!this.isSet ? 'Warning! setProperty called on model before set was called.' : 'Warning! setProperty called on read only model.');
            }
            //For chaining.
            return this;
        },
        //0.6.0 Delete a property from this.data via property path.
        deleteProperty: function deleteProperty(propertyPath){
            //A model's data properties cannot be deleted if the model hasn't been set yet or if the model is read only.
            if(this.isSet && !this.isReadOnly){
                findAndDeleteProperty(this.data, propertyPath);
                this.changedData[propertyPath] = undefined;
                this.isDirty = true;
                if(this.data.hasOwnProperty(this.idPropertyName)){
                    this.modelId = this.data[this.idPropertyName];
                }
                publishPropertyChangeEvent(this, propertyPath, undefined);
            }else{
                console.log(!this.isSet ? 'Warning! deleteProperty called on model before set was called.' : 'Warning! deleteProperty called on read only model.');
            }
        },
        //0.6.0 Returns true if model is new, false otherwise.
        isNew: function isNew(){
            return (typeof this.data[this.idPropertyName] === 'undefined');
        },
        //0.6.0 Returns stringified model's data hash.
        toJSON: function toJSON(){
            return JSON.stringify(this.data);
        },
        //0.6.0 Ajax "GET".
        ajaxGet: function ajaxGet(options){
            return ajax.call(this, 'get', options, v.ajax.ajaxGet);
        },
        //0.6.0 Ajax "POST".
        ajaxPost: function ajaxPost(options){
            return ajax.call(this, 'post', options, v.ajax.ajaxPost);
        },
        //0.6.0 Ajax "PUT".
        ajaxPut: function ajaxPut(options){
            return ajax.call(this, 'put', options, v.ajax.ajaxPut);
        },
        //0.6.0 Ajax "DELETE".
        ajaxDelete: function ajaxDelete(options){
            return ajax.call(this, 'delete', options, v.ajax.ajaxDelete);
        },
        //0.6.3 Returns this.isSilent (boolean).
        getIsSilent: function getIsSilent(){
            return this.isSilent;
        },
        //0.6.3 Sets this.isSilent (boolean).
        setIsSilent: function setIsSilent(isSilent){
            this.isSilent = isSilent;
        }
    };

    v.models = {extend: extend, propertyChangedEvent: propertyChangedEvent};
});

//0.6.0
define('collections', ['application', 'helpers', 'models', 'ajax'], function(){
    'use strict';

    var v = window.Coccyx = window.Coccyx || {},
        ext = v.helpers.extend,
        addEvent ='COLLECTION_MODEL_ADDED_EVENT',
        removeEvent ='COLLECTION_MODEL_REMOVED_EVENT',
        sortEvent ='COLLECTION_SORTED_EVENT',
        proto;

    function extend(collObj){
        var obj0 = Object.create(proto),
            obj1 = collObj ? ext(obj0, collObj) : obj0;
        //Collections have to know what their models' id property names are. Defaults to 'id', unless provided.
        obj1.modelsIdPropertyName = obj1.model && typeof obj1.model.idPropertyName !== 'undefined' ? obj1.model.idPropertyName : typeof obj1.modelsIdPropertyName !== 'undefined' ? obj1.modelsIdPropertyName : 'id';
        //Collections have to know what their models' endPoints are. Defaults to '/', unless provided.
        obj1.modelsEndPoint = obj1.model && typeof obj1.model.endPoint !== 'undefined' ? obj1.model.endPoint : typeof obj1.modelsEndPoint !== 'undefined' ? obj1.modelsEndPoint : '/';
        var obj2 = Object.create(obj1);
        obj2.isReadOnly = false;
        //0.6.3 Added isSilent
        obj2.isSilent = false;
        obj2.coll = [];
        obj2.deletedColl = [];
        //0.6.3 Eventer no longer placed on prototype as in prior versions. Its methods are now mixed in with the final object.
        return v.eventer.extend(obj2);
    }

    //Returns an array containing the raw data for each model in the models array.
    function toRaw(models){
        if(Array.isArray(models)){
            return models.map(function(model){
                return model.getData();
            });
        }
    }

    function compareArrays(a, b){
        if(Array.isArray(a) && Array.isArray(b)){
            if(a.length !== b.length){
                return false;
            }
            for(var i = 0, len = a.length; i < len; i++){
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

    //Returns true if element has the same properties as source and their values are equal, false otherwise.
    function isMatch(element, source){
        var prop;
        for(prop in source){
            if(source.hasOwnProperty(prop) && element.hasOwnProperty(prop)){
                if(typeof element[prop] === 'object' && typeof source[prop] === 'object'){
                    if(!compare(element[prop], source[prop])){
                        return false;
                    }
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

    //If it walks and talks like a duck... Checks for the following properties on a model's data:
    //isSet, isReadOnly, isDirty, originalData, changedData, data.
    //If data has all of the above then 'it is' a model and returns true, otherwise it returns false.
    function isAModel(obj){
        var markers = ['isSet', 'isReadOnly', 'isDirty', 'originalData', 'changedData', 'data'];
        for(var i = 0, len = markers.length; i < len; i++){
            if(!obj.hasOwnProperty(markers[i])){
                return false;
            }
        }
        return true;
    }

    //Makes a model from raw data and returns that model.
    function makeModelFromRaw(collObject, raw){
        var model = v.models.extend(collObject.model ? collObject.model :
            {idPropertyName: collObject.modelsIdPropertyName, endPoint: collObject.modelsEndPoint});
        model.setData(raw);
        return model;
    }

    //A simple general use, recursive iterator. Makes no assumptions about what args is. Args could be
    //anything - a function's arguments, an Array, an object or even a primitive.
    function iterate(args, callback){
        //If args is an Array or it has a length property it is iterable.
        if(Array.isArray(args) || args.hasOwnProperty('length')){
            for(var i = 0, len = args.length; i < len; i++){
                iterate(args[i], callback);
            }
        }else{
            //Not iterable.
            callback(args);
        }
    }

    //Wire the model's property change event to be handled by this collection.
    function wireModelPropertyChangedHandler(collObject, model){
        model.handle(v.models.propertyChangedEvent,
            collObject.modelPropertyChangedHandler, collObject);
        return model;
    }

    //Pushes [models] onto the collection. [models] can be either models or raw data. If [models] is raw data,
    //the raw data will be turned into models first before being pushed into the collection.
    //Collections proxy model property change events.
    function addModels(collObject, models){
        var pushed = [];
        if(Array.isArray(models)){
            models.forEach(function(model){
                collObject.coll.push(wireModelPropertyChangedHandler(collObject,
                    isAModel(model) ? model : makeModelFromRaw(collObject, model)));
                pushed.push(collObject.at(collObject.coll.length - 1));
            });
        }else{
            collObject.coll.push(wireModelPropertyChangedHandler(collObject,
                isAModel(models) ? models : makeModelFromRaw(collObject, models)));
            pushed.push(collObject.at(collObject.coll.length - 1));
        }
        return pushed;
    }

    //Calls iterate on args to generate and array of models.
    function argsToModels(collObject, args){
        var models = [];
        iterate(args, function(arg){
            var m = isAModel(arg) ? arg : makeModelFromRaw(collObject, arg);
            models.push(wireModelPropertyChangedHandler(collObject, m));
        });
        return models;
    }

    //0.6.3 Triggers an event via Eventer.
    function triggerEvent(event, args){
        /*jshint validthis:true*/
        if(!this.getIsSilent()){
            this.trigger(event, args);
        }
    }

    //0.6.3 Removes propertyChangedEvents from models.
    function removePropertyChangedEvents(models){
        /*jshint validthis:true*/
        var self = this;
        if(models){
            if(Array.isArray(models)){
                models.forEach(function(m){
                    m.off(v.models.propertyChangedEvent, self.modelPropertyChangedHandler);
                });
            }else{
                models.off(v.models.propertyChangedEvent, this.modelPropertyChangedHandler);
            }
        }
        return models;
    }

    //Collection prototype properties...
    proto = {
        /* Internal model property change event handler */

        modelPropertyChangedHandler: function modelPropertyChangedHandler(event, data){
            triggerEvent.call(this, event, data);
        },

        /* Mutators */

        //Sets the collection's data property to [models].
        setModels: function setModels(models, options){
            this.coll = [];
            addModels(this, models);
            this.isReadOnly = options && options.readOnly;
            return this;
        },
        //Works like [].pop. Fires removeEvent. Maintains deletedColl.
        pop: function pop(){
            var m = removePropertyChangedEvents.call(this, this.coll.pop());
            this.deletedColl.push(m);
            triggerEvent.call(this, v.collections.removeEvent, m);
            return m;
        },
        //Works like [].push. Fires addEvent.
        push: function push(models){
            var pushed = addModels(this, models);
            triggerEvent.call(this, v.collections.addEvent, pushed);
            return this.coll.length;
        },
        //Works like [].reverse.
        reverse: function reverse(){
            this.coll.reverse();
        },
        //Works like [].shift. Fires removeEvent. Maintains deletedColl.
        shift: function shift(){
            var m = removePropertyChangedEvents.call(this, this.coll.shift());
            this.deletedColl.push(m);
            triggerEvent.call(this, v.collections.removeEvent, m);
            return m;
        },
        //Works like [].sort(function(a,b){...}). Fires sortEvent.
        sort: function sort(callback){
            this.coll.sort(function(a, b){
                return callback(a, b);
            });
            triggerEvent.call(this, v.collections.sortEvent);
        },
        //Works like [].splice. Takes new [modlels] starting with the 3rd parameter. Maintains deletedColl. Fires addEvent and removeEvent.
        splice: function splice(index, howMany){
            var a =[index, howMany],
                aa = argsToModels(this, [].slice.call(arguments, 2));
            a = a.concat(aa);
            var m = removePropertyChangedEvents.call(this, [].splice.apply(this.coll, a));
            if(m.length){this.deletedColl.push.apply(this.deletedColl, m);}
            if(aa && aa.length){
                triggerEvent.call(this, v.collections.addEvent, aa);
            }
            if(howMany !== 0){
                triggerEvent.call(this, v.collections.removeEvent, m);
            }
            return m;
        },
        //Works like [].unshift. If raw data is passed it/they will first be converted to models.
        unshift: function unshift(){
            var added = argsToModels(this, arguments),
                l = [].unshift.apply(this.coll, added);
            triggerEvent.call(this, v.collections.addEvent, added);
            return l;
        },

        /* Accessors */

        //Returns an array of the deep copied data of all models in the collection
        getData: function getData(){
            return this.map(function(model){
                return model.getData();
            });
        },
        //Works like array[i].
        at: function at(index){
            return this.coll[index];
        },
        //Find a model by its id and return it.
        findById: function findById(id){
            for(var i = 0, len = this.coll.length; i < len; i++){
                if(this.at(i).modelId === id){
                    return this.at(i);
                }
            }
        },
        //Works like [].slice.
        slice: function slice(){
            var self = this;
            return [].slice.apply(this.coll, arguments).map(function(model){
                return makeModelFromRaw(self, model.getData());
            });
        },

        /* Iterators */

        //Invokes a callback function for each model in the collection with three arguments: the model, the model's
        //index, and the collection object's coll. If supplied, the second parameter will be used as the context for
        //the callback.
        forEach: function forEach(/*callback, context*/){
            [].forEach.apply(this.coll, [].slice.call(arguments, 0));
        },
        //Tests whether all models in the collection pass the test implemented by the provided callback.
        every: function every(/*callback, context*/){
            return [].every.apply(this.coll, [].slice.call(arguments, 0));
        },
        //Tests whether some model in the collection passes the test implemented by the provided callback.
        some: function some(/*callback, context*/){
            return [].some.apply(this.coll, [].slice.call(arguments, 0));
        },
        //Returns an array containing all the models that pass the test implemented by the provided callback.
        filter: function filter(/*callback, context*/){
            return [].filter.apply(this.coll, [].slice.call(arguments, 0));
        },
        //Creates a new array with the results of calling a provided function on every model in the collection.
        map: function map(/*callback, context*/){
            return [].map.apply(this.coll, [].slice.call(arguments, 0));
        },

        /* Sugar */

        //Loads a collection with data by fetching the data from the server via ajax. Returns a promise. Uses modelsEndPoint as the ajax call's url.
        fetch: function fetch(){
            var deferred = v.$.Deferred(),
                self = this,
                promise = v.ajax.ajaxGet({dataType: 'json', url: this.modelsEndPoint});
            promise.done(function(data){
                self.setModels(data);
                //v0.6.2 return self added.
                deferred.resolve(self);
            });
            promise.fail(function(json){
                //v0.6.2 return self added.
                deferred.reject(self, json);
            });
            return deferred.promise();
        },

        //Sets the readOnly flag on all models in the collection to isReadOnly.
        setReadOnly: function setReadOnly(readOnly){
            this.coll.forEach(function(model){
               model.isReadOnly = readOnly;
            });
            this.isReadOnly = readOnly;
        },
        //Removes all models from the collection whose data properties matches those of matchingPropertiesHash.
        //Any models removed from their collection will also have their property changed event handlers removed.
        //Removing models causes a remove event to be fired, and the removed models are passed along as the 2nd
        //argument to the event handler's callback function. Maintains deletedColl.
        remove: function remove(matchingPropertiesHash){
            var removed = [], newColl;
            if(this.coll.length === 0 || isArrayOrNotObject(matchingPropertiesHash)){
                return;
            }
            newColl = this.coll.filter(function(el){
                if(isMatch(el.data, matchingPropertiesHash)){
                    removed.push(el);
                    return false;
                }
                return true;
            });
            if(removed.length){
                this.deletedColl.push.apply(this.deletedColl, removePropertyChangedEvents.call(this, removed));
                this.coll = newColl;
                triggerEvent.call(this, v.collections.removeEvent, removed);
            }
            return removed;
        },
        //Returns true if the coll has at least one model whose data properties matches those of matchingPropertiesHash.
        has: function has(matchingPropertiesHash){
            if(isArrayOrNotObject(matchingPropertiesHash)){
                return false;
            }
            return this.coll.some(function(el){
                return isMatch(el.data, matchingPropertiesHash);
            });
        },
        //Returns an array whose elements contain the stringified value of their model's data.
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
        //Same as Coccyx.collections.toRaw(models). See above for details.
        toRaw: toRaw,
        //0.6.3 Returns this.isSilent (boolean).
        getIsSilent: function getIsSilent(){
            return this.isSilent;
        },
        //0.6.3 Sets this.isSilent (boolean).
        setIsSilent: function setIsSilent(isSilent){
            this.isSilent = isSilent;
        },
        //0.6.3 Returns the length of this.coll.
        getLength: function getLength(){
            return this.coll.length;
        }
    };

    v.collections = {extend: extend, toRaw: toRaw, addEvent: addEvent, removeEvent: removeEvent, sortEvent: sortEvent};

});

define('router', ['application', 'helpers'], function() {
    'use strict';

    var v = window.Coccyx = window.Coccyx || {},
        contains = v.helpers.contains;

    function route(verb, url, valuesHash){
        //0.6.1 Call Coccyx.init() only once before handling any routing requests. See application.js for details.
        if(!v.initCalled){
            v.init();
            v.initCalled = true;
            console.log('Coccyx.init called');
        }
        var rt = getRoute(verb, url);
        if(rt){
            routeFound(rt, valuesHash);
        }else{
            routeNotFound(verb, url);
        }
    }

    function getRoute(verb, url){
        var routes = v.controllers.getRoutes(),
            a = url.substring(1).split('/'),
            params = [],
            rel = false,
            route, b, c, eq, vrb;
        for(route in routes){
            if(routes.hasOwnProperty(route)){
                //Get the 'veb'.
                vrb = route.substring(0, route.indexOf(' '));
                //Get the url.
                b = route.substring(route.indexOf('/') + 1).split('/');
                if(verb === vrb && (a.length === b.length || contains(route, '*'))){
                    eq = true;
                    //The url and the route have the same number of segments so the route
                    //can be either static or it could contain parameterized segments.
                    for(var i = 0, len = b.length; i < len; i++){
                        //If the segments are equal then continue looping.
                        if(a[i] === b[i]){
                            continue;
                        }
                        //If the route segment is parameterized then save the parameter and continue looping.
                        if(contains(b[i],':')){
                            //0.4.0 - checking for 'some:thing'
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
                        //If the route is a relative route, push it onto the array and break out of the loop.
                        if(contains(b[i], '*')){
                            rel = true;
                            eq = false;
                            break;
                        }
                        //If none of the above
                        eq = false;
                        break;
                    }
                    //The route matches the url so attach the params (it could be empty) to the route and return the route.
                    if(eq){
                        //controller name, function to call, function arguments to call with...
                        return {controllerName: /*b[0]*/ routes[route][0], fn: routes[route][1], params: params};
                    }
                    if(rel){
                        //controller name, function to call, function arguments to call with...
                        for(var ii = i, llen = a.length, relUrl = ''; ii < llen; ii++){
                            relUrl += ('/' + a[ii]);
                        }
                        //controller name, function to call, function arguments to call with...
                        return {controllerName: /*b[0]*/ routes[route][0], fn: routes[route][1], params: [relUrl]};
                    }
                }
            }
        }
    }

    function routeFound(route, valuesHash){
        //0.6.0 Prior versions called controller.init() when the controller is loaded. Starting with 0.6.0,
        //controller.init() is only called when routing is called to one of their route callbacks. This
        //eliminates unnecessary initialization if the controller is never used.
        var controller = v.controllers.getController(route.controllerName);
        if(controller.hasOwnProperty('init') && !controller.hasOwnProperty('initCalled')){
            controller.init();
            controller.initCalled = true;
        }
        //Route callbacks are bound (their contexts (their 'this')) to their controllers.
        if(valuesHash){
            route.fn.call(controller, valuesHash);
        }else if(route.params.length){
            route.fn.apply(controller, route.params);
        }else{
            route.fn.call(controller);
        }
    }

    function routeNotFound(url){
        console.log('router::routeNotFound called with route = ' + url);
    }

    v.router = {route: route};
});

define('views', ['application', 'helpers'], function(){
    'use strict';

    var v = window.Coccyx = window.Coccyx || {},
        domEventTopic = 'DOM_EVENT',
        proto;

    //0.6.0
    //Wire view dom events to callback methods in the controller
    //using the context of the controller when calling the callbacks.
    //domEventsHash = {controller: controller, events: {'event selector': callback, ...}}.
    function wireDomEvents(domEventsHash, $domTarget, namespace){
        var prop, a;
        for(prop in domEventsHash.events){
            if(domEventsHash.events.hasOwnProperty(prop)){
                a = prop.split(' ');
                $domTarget.on(a[0] + namespace, a[1],
                    domEventsHash.events[prop].bind(domEventsHash.controller));
            }
        }
    }

    //0.6.0
    //Every view must have a domTarget property, which is used to render the view.
    //Views can be rendered in 1 of 2 ways, either "detached" or "attached" to the DOM.
    //To render as detached, provide either a tagName property ('div', 'section', 'article',
    //'span', etc.) and a domTargetAttrs property (a hash, that can contain an id property, a class
    //property and other element attributes as properties), or set the domTarget property (either
    //a string, whose value would be appropriate for calling document.createElement(domTarget),
    //or a callback to a function that returns a string appropriate for calling
    //document.createElement(domTarget)) yourself, or omit domTarget and domTargetAttrs altogether
    //and a default domTarget will be provided for you, which will be a plain "<div>" element.
    //To render as attached, set $domTarget to a valid jquery object and domTarget will be created
    //for you from $domTarget.
    function setTarget(){
        /*jshint validthis:true*/
        if(this.$domTarget && this.$domTarget instanceof v.$){
            //Use $domTarget.
            this.domTarget = this.$domTarget[0];
        }else if(this.domTarget){
            //Use domTarget.
            this.domTarget = document.createElement(typeof this.domTarget === 'string' ? this.domTarget : this.domTarget());
            this.$domTarget = v.$(this.domTarget);
        }else if(this.domTargetAttrs){
            //Use domTargetAttrs.
            this.$domTarget = v.$(document.createElement(this.tagName ?
               this.tagName : 'div')).attr(this.domTargetAttrs);
            this.domTarget = this.$domTarget[0];
        }else{
            //Default to 'div'.
            this.domTarget = document.createElement('div');
            this.$domTarget = v.$(this.domTarget);
        }
    }

    //0.5.0, 0.6.0
    function extend(viewObject, domEventsHash){
        //Create a new object using the view object as its prototype.
        var obj1 =  v.helpers.extend(Object.create(proto), viewObject),
            obj2 = Object.create(obj1);
        //0.6.0 Set domTarget && $domTarget
        setTarget.call(obj2);
        //0.6.0 Wire up events, if any are declared.
        if(domEventsHash){
            obj2.namespace = '.' + Date.now().toString();
            wireDomEvents(typeof domEventsHash === 'function' ? domEventsHash() : domEventsHash, obj2.$domTarget, obj2.namespace);
        }
        return obj2;
    }

    proto = {
        remove: function remove(){
            this.$domTarget.off(this.namespace);
            this.$domTarget.empty();
        },
        $: v.$
    };

    v.views = {extend: extend, domEventTopic: domEventTopic};
});

//0.6.0
define('eventer', ['application', 'helpers'], function(){
    'use strict';

    //Coccyx.eventer turns any object into an "eventing" object and is based on jQuery's eventing model.
    //Example: v.eventer.extend(someObjet); someObject.handle('ping', callback); ... someObject.trigger('ping');

    var v = window.Coccyx = window.Coccyx || {}, eventerApi;

    eventerApi = {
        //Attach a callback handler to a specific custom event or events fired from 'this' object optionally binding the callback to context.
        handle: function handle(events, callback, context){
            v.$(this._eventedObj).on(events, context? v.$.proxy(callback, context) : callback);
        },
        //Like handle but will only fire the event one time and will ignore subsequent events.
        handleOnce: function handleOnce(events, callback, context){
            v.$(this._eventedObj).one(events, context? v.$.proxy(callback, context) : callback);
        },
        //Removes event handler.
        off: function off(events, callback){
            if(events && callback){
                v.$(this._eventedObj).off(events, callback);
            }else if(events){
                //0.6.3 removes all event handlers for events
                v.$(this._eventedObj).off(events);
            }else{
                //0.6.3 removes all event handlers for all events
                v.$(this._eventedObj).off();
            }
        },
        //Trigger an event for object optionally passing args if provided.
        trigger: function trigger(events, args){
            v.$(this._eventedObj).trigger(events, args);
        }
    };

    function extend(obj){
        //0.6.3 Implementation now placed directly on obj instead of added as a prototype.
        var obj0 = obj._eventedObj ? obj : v.helpers.extend(obj, eventerApi);
        //0.6.3 Add eventedObj to obj.
        obj0._eventedObj = obj._eventedObj ? obj._eventedObj : {};
        return obj0;
    }

    v.eventer = {extend: extend};
});

define('ajax', ['application'], function(){
    'use strict';

    var v = window.Coccyx = window.Coccyx || {},
        extend = v.helpers.extend,
        defaultSettings = {cache: false, url: '/'};

        //Merge default setting with user's settings.
        function mergeSettings(settings){
            return extend({}, defaultSettings, settings);
        }

    //A simple promise-based wrapper around jQuery Ajax. All methods return a Promise.
    v.ajax = {
        //http "GET"
        ajaxGet: function ajaxGet(settings){
            settings.type = 'GET';
            return v.$.ajax(mergeSettings(settings));
        },
        //http "POST"
        ajaxPost: function ajaxPost(settings){
            settings.type = 'POST';
            return v.$.ajax(mergeSettings(settings));
        },
        //http "PUT"
        ajaxPut: function ajaxPut(settings){
            settings.type = 'PUT';
            return v.$.ajax(mergeSettings(settings));
        },
        //http "DELETE"
        ajaxDelete: function ajaxDelete(settings){
            settings.type = 'DELETE';
            return v.$.ajax(mergeSettings(settings));
        }
    };

});

define('coccyx', ['application', 'helpers', 'router', 'history', 'models', 'collections', 'views', 'eventer', 'ajax'], function () {
    'use strict';
    return window.Coccyx;
});
