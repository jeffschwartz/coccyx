//0.6.0
define('collections', ['helpers', 'ajax', 'application', 'models'], function(){
    'use strict';

    //0.6.3 added isSilent
    var v = window.Coccyx = window.Coccyx || {}, ext = v.helpers.extend, addEvent ='COLLECTION_MODEL_ADDED_EVENT', removeEvent ='COLLECTION_MODEL_REMOVED_EVENT', sortEvent ='COLLECTION_SORTED_EVENT', isSilent = v.helpers.isSilent, proto;

    function extend(collObj){
        var obj0 = Object.create(proto), obj1 = collObj ? ext(obj0, collObj) : obj0;
        //Collections have to know what their models' id property names are. Defaults to 'id', unless provided.
        obj1.modelsIdPropertyName = obj1.model && typeof obj1.model.idPropertyName !== 'undefined' ? obj1.model.idPropertyName : typeof obj1.modelsIdPropertyName !== 'undefined' ? obj1.modelsIdPropertyName : 'id';
        //Collections have to know what their models' endPoints are. Defaults to '/', unless provided.
        obj1.modelsEndPoint = obj1.model && typeof obj1.model.endPoint !== 'undefined' ? obj1.model.endPoint : typeof obj1.modelsEndPoint !== 'undefined' ? obj1.modelsEndPoint : '/';
        var obj2 = Object.create(obj1);
        obj2.isReadOnly = false;
        obj2.coll = [];
        obj2.deletedColl = [];
        //0.6.3 Eventer no longer placed on prototype as in prior versions. Its methods are now mixed in with the final object.
        return v.eventer.extend(obj2);
    }

    //Returns an array containing the raw data for each model in the models array.
    function toRaw(models){if(Array.isArray(models)){return models.map(function(model){return model.getData();});} }

    function compareArrays(a, b){
        if(Array.isArray(a) && Array.isArray(b)){
            if(a.length !== b.length){return false;}
            for(var i = 0, len = a.length; i < len; i++){
                if(typeof a[i] === 'object' && typeof b[i] === 'object'){if(!compareObjects(a[i], b[i])){return false;} continue;}
                if(typeof a[i] === 'object' || typeof b[i] === 'object'){return false;}
                if(Array.isArray(a[i]) && Array.isArray(b[i])){if(!compareArrays(a[i], b[i])){return false;} continue;}
                if(Array.isArray(a[i]) || Array.isArray(b[i])){return false;}
                if(a[i] !== b[i]){return false;}
            }
            return true;
        }
        return false;
    }

    function compareObjects(a, b){
        var prop;
        if(compareArrays(a, b)){return true;}
        for(prop in a){
            if(a.hasOwnProperty(prop) && b.hasOwnProperty(prop)){
                if(typeof a[prop] === 'object' && typeof b[prop] === 'object'){if(!compareObjects(a[prop], b[prop])){return false;} continue;}
                if(typeof a[prop] === 'object' || typeof b[prop] === 'object'){return false;}
                if(a[prop] !== b[prop]){return false;}
            }else {return false;}
        }
        return true;
    }

    function compare(a, b){return compareObjects(a, b) && compareObjects(b, a);}

    //Returns true if element has the same properties as source and their values are equal, false otherwise.
    function isMatch(element, source){
        for(var prop in source){
            if(source.hasOwnProperty(prop) && element.hasOwnProperty(prop)){
                if(typeof element[prop] === 'object' && typeof source[prop] === 'object'){if(!compare(element[prop], source[prop])){return false;}}
                else if(typeof element[prop] === 'object' || typeof source[prop] === 'object'){return false;}
                else{if(source[prop] !== element[prop]){return false;}}
            }else{return false;}
        }
        return true;
    }

    function isArrayOrNotObject(value){return Array.isArray(value) || typeof value !== 'object' ? true : false;}

    //If it walks and talks like a duck... Checks for the following properties on a model's data:
    //isSet, isReadOnly, isDirty, originalData, changedData, data.
    //If data has all of the above then 'it is' a model and returns true, otherwise it returns false.
    function isAModel(obj){
        var markers = ['isSet', 'isReadOnly', 'isDirty', 'originalData', 'changedData', 'data'];
        for(var i = 0, len = markers.length; i < len; i++){if(!obj.hasOwnProperty(markers[i])){return false;}}
        return true;
    }

    //Makes a model from raw data and returns that model.
    function makeModelFromRaw(collObject, raw){
        var model = v.models.extend(collObject.model ? collObject.model : {idPropertyName: collObject.modelsIdPropertyName, endPoint: collObject.modelsEndPoint});
        model.setData(raw);
        return model;
    }

    //A simple general use, recursive iterator. Makes no assumptions about what args is. Args could be
    //anything - a function's arguments, an Array, an object or even a primitive.
    function iterate(args, callback){
        //If args is an Array or it has a length property it is iterable.
        if(Array.isArray(args) || args.hasOwnProperty('length')){for(var i = 0, len = args.length; i < len; i++){iterate(args[i], callback);} }
        else{
            //Not iterable.
            callback(args);
        }
    }

    //Wire the model's property change event to be handled by this collection.
    function wireModelPropertyChangedHandler(collObject, model){
        model.handle(v.models.propertyChangedEvent, collObject.modelPropertyChangedHandler, collObject);
        return model;
    }

    //Pushes [models] onto the collection. [models] can be either models or raw data. If [models] is raw data, the raw data
    //will be turned into models first before being pushed into the collection. Collections proxy model property change events.
    function addModels(collObject, models){
        var pushed = [];
        if(Array.isArray(models)){
            models.forEach(function(model){
                collObject.coll.push(wireModelPropertyChangedHandler(collObject, isAModel(model) ? model : makeModelFromRaw(collObject, model)));
                pushed.push(collObject.at(collObject.coll.length - 1));
            });
        }else{
            collObject.coll.push(wireModelPropertyChangedHandler(collObject, isAModel(models) ? models : makeModelFromRaw(collObject, models)));
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

    //0.6.3 Removes propertyChangedEvents from models.
    function removePropertyChangedEvents(models){
        /*jshint validthis:true*/
        var self = this;
        if(models){
            if(Array.isArray(models)){models.forEach(function(m){m.off(v.models.propertyChangedEvent, self.modelPropertyChangedHandler);});}
            else{models.off(v.models.propertyChangedEvent, this.modelPropertyChangedHandler);}
        }
        return models;
    }

    //Collection prototype properties...
    proto = {
        /* Internal model property change event handler */

        modelPropertyChangedHandler: function modelPropertyChangedHandler(event, data){this.trigger(event, data);},

        /* Mutators */

        //Sets the collection's data property to [models].
        setModels: function setModels(models, options){
            this.coll = [];
            addModels(this, models);
            this.isReadOnly = options && options.readOnly;
            return this;
        },
        //Works like [].pop. Fires removeEvent if options.silent isn't passed or is false. Maintains deletedColl.
        pop: function pop(){
            var m = removePropertyChangedEvents.call(this, this.coll.pop());
            this.deletedColl.push(m);
            //0.6.3 Check for silent.
            if(!isSilent(arguments)){this.trigger(v.collections.removeEvent, m);}
            return m;
        },
        //Works like [].push. Fires addEvent if options.silent isn't passed or it is false.
        push: function push(models){
            var pushed = addModels(this, models);
            //0.6.3 Check for silent.
            if(!isSilent(arguments)){this.trigger(v.collections.addEvent, pushed);}
            return this.coll.length;
        },
        //Works like [].reverse.
        reverse: function reverse(){this.coll.reverse();},
        //Works like [].shift. Fires removeEvent if options.silent isn't passed or it is false. Maintains deletedColl.
        shift: function shift(){
            var m = removePropertyChangedEvents.call(this, this.coll.shift());
            this.deletedColl.push(m);
            //0.6.3 Check for silent.
            if(!isSilent(arguments)){this.trigger(v.collections.removeEvent, m);}
            return m;
        },
        //Works like [].sort(function(a,b){...}). Fires sortEvent if options.silent isn't passed or it is false.
        sort: function sort(callback){
            this.coll.sort(function(a, b){return callback(a, b);});
            //0.6.3 Check for silent.
            if(!isSilent(arguments)){this.trigger(v.collections.sortEvent);}
        },
        //Works like [].splice. Takes model or [modlels] as 3rd parameter. Maintains deletedColl. Fires addEvent and removeEvent if options.silent isn't passed or it is false.
        splice: function splice(index, howMany, models){
            var a =[index, howMany],
                // aa = argsToModels(this, [].slice.call(arguments, 2));
                aa = argsToModels(this, models);
            a = a.concat(aa);
            var m = removePropertyChangedEvents.call(this, [].splice.apply(this.coll, a));
            if(m.length){this.deletedColl.push.apply(this.deletedColl, m);}
            //0.6.3 Check for silent.
            if(!isSilent(arguments) && aa && aa.length){this.trigger(v.collections.addEvent, aa);}
            //0.6.3 Check for silent.
            if(!isSilent(arguments) && howMany !== 0){this.trigger(v.collections.removeEvent, m);}
            return m;
        },
        //Works like [].unshift. Takes model or [models] as 1st parameter. If raw data is passed it/they will first be converted to models. Fires addEvent if options.silent isn't passed or it is false.
        unshift: function unshift(models){
            // var added = argsToModels(this, arguments),
            var added = argsToModels(this, models), l = [].unshift.apply(this.coll, added);
            //0.6.3 Check for silent.
            if(!isSilent(arguments)){this.trigger(v.collections.addEvent, added);}
            return l;
        },

        /* Accessors */

        //Returns an array of the deep copied data of all models in the collection
        getData: function getData(){return this.map(function(model){return model.getData();});},
        //Works like array[i].
        at: function at(index){return this.coll[index];},
        //Find a model by its id and return it.
        findById: function findById(id){for(var i = 0, len = this.coll.length; i < len; i++){if(this.at(i).modelId === id){return this.at(i);}}},
        //Works like [].slice.
        slice: function slice(){var self = this; return [].slice.apply(this.coll, arguments).map(function(model){return makeModelFromRaw(self, model.getData());});},

        /* Iterators */

        //Invokes a callback function for each model in the collection with three arguments: the model, the model's
        //index, and the collection object's coll. If supplied, the second parameter will be used as the context for
        //the callback.
        forEach: function forEach(/*callback, context*/){[].forEach.apply(this.coll, [].slice.call(arguments, 0));},
        //Tests whether all models in the collection pass the test implemented by the provided callback.
        every: function every(/*callback, context*/){return [].every.apply(this.coll, [].slice.call(arguments, 0));},
        //Tests whether some model in the collection passes the test implemented by the provided callback.
        some: function some(/*callback, context*/){return [].some.apply(this.coll, [].slice.call(arguments, 0));},
        //Returns an array containing all the models that pass the test implemented by the provided callback.
        filter: function filter(/*callback, context*/){return [].filter.apply(this.coll, [].slice.call(arguments, 0));},
        //Creates a new array with the results of calling a provided function on every model in the collection.
        map: function map(/*callback, context*/){return [].map.apply(this.coll, [].slice.call(arguments, 0));},

        /* Sugar */

        //Loads a collection with data by fetching the data from the server via ajax, uses modelsEndPoint as the url & returns a promise. v0.6.4 Added argument dataType and call to collection.parse().
        fetch: function fetch(dataType){
            var options = {url: this.modelsEndPoint}, deferred = v.$.Deferred(), self = this, promise;
            if(dataType){options.dataType = dataType;}
            promise = v.ajax.ajaxGet(options);
            //v0.6.2 return self added.
            promise.done(function(data){
                //0.6.4. If data was returned call parse.
                data = data ? self.parse(data) : data;
                //If data was returned set this model's data. 0.6.4 Made call setModels conditional on data.
                if(data){self.setModels(data);}
                deferred.resolve(self);
            });
            //v0.6.2 return self added. v0.6.4 Now returns jqXHR, textStatus & errorThrown
            promise.fail(function(jqXHR, textStatus, errorThrown){deferred.reject(self, jqXHR, textStatus, errorThrown);});
            return deferred.promise();
        },
        //Sets the readOnly flag on all models in the collection to isReadOnly.
        setReadOnly: function setReadOnly(readOnly){this.coll.forEach(function(model){model.isReadOnly = readOnly;}); this.isReadOnly = readOnly;},
        //Removes all models from the collection whose data properties matches those of matchingPropertiesHash. Any models removed from their
        //collection will also have their property changed event handlers removed. Removing models causes a remove event to be fired if
        //options.silent isn't passed or is false, and the removed models are passed along as the 2nd argument to the event handler's callback
        //function. Maintains deletedColl.
        remove: function remove(matchingPropertiesHash){
            var removed = [], newColl;
            if(this.coll.length === 0 || isArrayOrNotObject(matchingPropertiesHash)){return;}
            newColl = this.coll.filter(function(el){
                if(isMatch(el.data, matchingPropertiesHash)){removed.push(el); return false;}
                return true;
            });
            if(removed.length){
                this.deletedColl.push.apply(this.deletedColl, removePropertyChangedEvents.call(this, removed));
                this.coll = newColl;
                //0.6.3 Check for silent.
                if(!isSilent(arguments)){this.trigger(v.collections.removeEvent, removed);}
            }
            return removed;
        },
        //Returns true if the coll has at least one model whose data properties matches those of matchingPropertiesHash.
        has: function has(matchingPropertiesHash){
            if(isArrayOrNotObject(matchingPropertiesHash)){return false;}
            return this.coll.some(function(el){return isMatch(el.data, matchingPropertiesHash);});
        },
        //Returns an array whose elements contain the stringified value of their model's data.
        find: function find(matchingPropertiesHash){
            if(isArrayOrNotObject(matchingPropertiesHash)){return null;}
            return this.coll.filter(function(el){return isMatch(el.data, matchingPropertiesHash);});
        },
        //Stringifies all models data and returns them in an array.
        toJSON: function toJSON(){
            return  this.coll.map(function(el){return JSON.stringify(el.getData());});
        },
        //Same as Coccyx.collections.toRaw(models). See above for details.
        toRaw: toRaw,
        //Returns the length of the collection.
        getLength: function getLength(){return this.coll.length;},
        //0.6.4 Override to transform the data returned from collection.fetch and return json.
        parse: function parse(data){return data;}
    };

    v.collections = {extend: extend, toRaw: toRaw, addEvent: addEvent, removeEvent: removeEvent, sortEvent: sortEvent};

});
