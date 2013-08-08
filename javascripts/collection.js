define('collections', [], function(){
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
        some: function(callback, context){
            return [].some.call(this.coll, callback, context);
        },
        //Returns an array containing all the models that pass
        //the test implemented by the provided callback.
        filter: function(callback, context){
            return [].filter.call(this.coll, callback, context);
        },
        //Creates a new array with the results of calling a
        //provided function on every model in the collection.
        map: function(callback, context){
            return [].map.call(this.coll, callback, context);
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
        //Returns all the models whose data properties
        //match those of matchingPropertiesHash.
        find: function find(matchingPropertiesHash){
            if(isArrayOrNotObject(matchingPropertiesHash)){
                return null;
            }
            return this.coll.filter(function(el){
                return isMatch(el.data, matchingPropertiesHash);
            });
        },
        //Returns an array of stringified json objects,
        //one for each model's data in the collection.
        toJSON: function toJSON(){
            return  this.coll.map(function(el){
                return JSON.stringify(el);
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
