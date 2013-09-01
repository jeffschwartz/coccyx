//0.6.0
define('collections', [], function(){
    'use strict';

    var Coccyx = window.Coccyx = window.Coccyx || {},
        eventerProto,
        proto;

    //Extend the application's collection object.
    function extend(collObj){
        //Create a new object using proto as its prototype and extend that object with collObj if it was supplied.
        var obj0 = Coccyx.helpers.extend(Object.create(eventerProto), proto);
        var obj1 = collObj ? Coccyx.helpers.extend(obj0, collObj) : obj0;
        //Collections have to know what their models' id property names are. Defaults to 'id', unless provided.
        obj1.modelsIdPropertyName = typeof obj1.modelsIdPropertyName === 'undefined' ? 'id' : obj1.modelsIdPropertyName;
        //Collections have to know what their models' endPoints are. Defaults to '/', unless provided.
        obj1.modelsEndPoint = typeof obj1.modelsEndPoint === 'undefined' ? '/' : obj1.modelsEndPoint;
        var obj2 = Object.create(obj1);
        obj2.isReadOnly = false;
        obj2.coll = [];
        obj2.length = 0;
        return obj2;
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
        var markers = ['isSet', 'isReadOnly', 'isDirty', 'originalData', 'changedData', 'data'],
            i,
            len;
        for(i = 0, len = markers.length; i < len; i++){
            if(!obj.hasOwnProperty(markers[i])){
                return false;
            }
        }
        return true;
    }

    //Makes a model from raw data and returns that model.
    function makeModelFromRaw(raw, modelsIdPropertyName, modelsEndPoint){
        var model = Coccyx.models.extend({idPropertyName: modelsIdPropertyName, endPoint: modelsEndPoint});
        model.setData(raw);
        return model;
    }

    //A simple general use, recursive iterator. Makes no assumptions about what args is. Args could be
    //anything - a function's arguments, an Array, an object or even a primitive.
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

    //Wire the model's property change event to be handled by this collection.
    function wireModelPropertyChangedHandler(collObject, model){
        model.handle(Coccyx.models.propertyChangedEventTopic,
            collObject.modelPropertyChangedHandler, collObject);
        return model;
    }

    //Pushes [models] onto the collection. [models] can be either models or raw data. If [models] is raw data,
    //the raw data will be turned into models first before being pushed into the collection.
    //Collections proxy model property change events.
    function addModels(collObject, models){
        if(Array.isArray(models)){
            models.forEach(function(model){
                collObject.coll.push(wireModelPropertyChangedHandler(collObject,
                    isAModel(model) ? model : makeModelFromRaw(model, collObject.modelsIdPropertyName, collObject.modelsEndPoint)));
            });
        }else{
            collObject.coll.push(wireModelPropertyChangedHandler(collObject,
                isAModel(models) ? models : makeModelFromRaw(models, collObject.modelsIdPropertyName, collObject.modelsEndPoint)));
        }
    }

    //Calls iterate on args to generate and array of models.
    function argsToModels(collObject, args){
        var models = [];
        iterate(args, function(arg){
            var m = isAModel(arg) ? arg : makeModelFromRaw(arg, collObject.modelsIdPropertyName, collObject.modelsEndPoint);
            models.push(wireModelPropertyChangedHandler(collObject, m));
        });
        return models;
    }

    //Eventer prototype properties...
    eventerProto = {
        eventObject: {},
        //Attach a callback handler to a specific custom event or events fired from 'this' object optionally binding the callback to context.
        handle: function handle(events, callback, context){
            $(this.eventObject).on(events, context? $.proxy(callback, context) : callback);
        },
        //Like handle but will only fire the event one time and will ignore subsequent events.
        handleOnce: function handleOnce(events, callback, context){
            $(this.eventObject).one(events, context? $.proxy(callback, context) : callback);
        },
        //Removes the handler.
        removeHandler: function removeHandler(events, callback){
            $(this.eventObject).off(events, callback);
        },
        //Fire an event for object optionally passing args if provide.
        emitEvent: function emitEvent(events, args){
            $(this.eventObject).trigger(events, args);
        }
    };

    //Collection prototype properties...
    proto = {
        /* Internal model property change event handler */

        modelPropertyChangedHandler: function modelPropertyChangedHandler(event, data){
            this.emitEvent(event, data);
        },

        /* Mutators */

        //Sets the collection's data property to [models].
        setModels: function setModels(models, options){
            this.coll = [];
            addModels(this, models);
            this.isReadOnly = options && options.readOnly;
            this.length = this.coll.length;
            return this;
        },
        //Pops the last model from the collection's data property and returns that model.
        pop: function pop(){
            var m = this.coll.pop();
            this.length = this.coll.length;
            this.emitEvent(Coccyx.collections.removeEvent);
            return m;
        },
        //Push [models] onto the collection' data property and returns the length of the collection.
        push: function push(models){
            addModels(this, models);
            this.length = this.coll.length;
            this.emitEvent(Coccyx.collections.addEvent);
            return this.length;
        },
        reverse: function reverse(){
            this.coll.reverse();
        },
        shift: function shift(){
            var m = this.coll.shift();
            this.length = this.coll.length;
            this.emitEvent(Coccyx.collections.removeEvent);
            return m;
        },
        //Works the same as Array.sort(function(a,b){...})
        sort: function sort(callback){
            this.coll.sort(function(a, b){
                return callback(a, b);
            });
            this.emitEvent(Coccyx.collections.sortEvent);
        },
        //Adds and optionally removes models. Takes new [modlels] starting with the 3rd parameter.
        splice: function splice(index, howMany){
            var a =[index, howMany],
                aa = argsToModels(this, [].slice.call(arguments, 2));
            a = a.concat(aa);
            var m = [].splice.apply(this.coll, a);
            this.length = this.coll.length;
            if(arguments.length === 3){
                this.emitEvent(Coccyx.collections.addEvent);
            }
            if(howMany !== 0){
                this.emitEvent(Coccyx.collections.removeEvent);
            }
            return m;
        },
        //Adds one or more models to the beginning of an array and returns the new length of the array. If raw data is passed instead of
        //models, they will be converted to models first, and then added to the collection.
        unshift: function unshift(){
            var m = [].unshift.apply(this.coll, argsToModels(this, arguments));
            this.length = this.coll.length;
            this.emitEvent(Coccyx.collections.addEvent);
            return m;
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
            for(var i = 0; i < this.length; i++){
                if(this.at(i).modelId === id){
                    return this.at(i);
                }
            }
        },
        //Returns a copy of a portion of the models in the collection.
        slice: function slice(){
            var self = this;
            return [].slice.apply(this.coll, arguments).map(function(model){
                return makeModelFromRaw(model.getData(), self.modelsIdPropertyName, self.modelsEndPoint);
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
        //argument to the event handler's callback function.
        remove: function remove(matchingPropertiesHash){
            var newColl,
                removed = [],
                self = this;
            if(this.length === 0 || isArrayOrNotObject(matchingPropertiesHash)){
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
                removed.forEach(function(el){
                    el.removeHandler(Coccyx.models.propertyChangedEventTopic,
                        self.modelPropertyChangedHandler);
                });
                this.coll = newColl;
                this.length = this.coll.length;
                this.emitEvent(Coccyx.collections.removeEvent);
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
        toRaw: toRaw
    };

    Coccyx.collections = {
        extend: extend,
        toRaw: toRaw,
        addEvent: 'COLLECTION_MODEL_ADDED_EVENT',
        removeEvent: 'COLLECTION_MODEL_REMOVED_EVENT',
        sortEvent: 'COLLECTION_SORTED_EVENT'
    };

});
