define('collections', [], function(){
    'use strict';

    var Coccyx = window.Coccyx = window.Coccyx || {},
        proto;

    //Extend the application's collection object.
    function extend(collectionObject){
        // Create a new object using proto as its prototype and extend
        // that object with collectionObject if it was supplied.
        var obj1 = collectionObject ? Coccyx.helpers.extend(Object.create(proto), collectionObject) : proto;
        var obj2 = Object.create(obj1);
        obj2.readOnly = false;
        obj2.coll = [];
        obj2.length = 0;
        return obj2;
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
                }
                if(typeof a[i] === 'object' || typeof b[i] === 'object'){
                    return false;
                }
                if(Array.isArray(a[i]) && Array.isArray(b[i])){
                    if(!compareArrays(a[i], b[i])){
                        return false;
                    }
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

    //Returns true if element has the same properties as
    //source and their values are equal, false otherwise.
    function isMatch(element, source){
        var prop;
        for(prop in source){
            if(source.hasOwnProperty(prop) && element.hasOwnProperty(prop)){
                if(typeof element[prop] === 'object' && typeof source[prop] === 'object'){
                    if(!compareObjects(element[prop], source[prop])){
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

    function isNotAnObjectOrIsAnArray(value){
        return typeof value !== 'object' || Array.isArray(value) ? true : false;
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

    function argumentsToModels(args){
        var newModels;
        newModels = [].slice.call(args, 0);
        return newModels.map(function(model){
            return isAModel(model) ? model : makeModelFromRaw(model);
        });
    }

    //Collection prototype properties...
    proto = {
        //Sets the collection's data property to [models].
        setModels: function setModels(models, isReadOnly){
            addModels(this.coll, models);
            this.readOnly = !!isReadOnly;
            this.length = this.coll.length;
            return this;
        },

        /* Mutators */

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
                aa = argumentsToModels([].slice.call(arguments, 2));
            a = a.concat(aa);
            var m = [].splice.apply(this.coll, a);
            this.length = this.coll.length;
            return m;
        },
        unshift: function unshift(){
            var m = [].unshift.apply(this.coll, argumentsToModels(argumentsToModels));
            this.length = this.coll.length;
            return m;
        },

        /* Accessors */

        //Works like array[i].
        at: function(index){
            return this.coll[index];
        },
        //Returns a new array comprised of a this collection object's coll joined with other
        //array(s) and / or value(s). It does not alter the collection object's internal coll.
        concat: function(){
            return [].concat.apply(this.coll, arguments);
        },
        //Joins all elements of this collection object's coll into a string.
        join: function(){
            return [].join.apply(this.coll, arguments);
        },
        //Returns a shallow copy of a portion of an array.
        slice: function(){
            return [].slice.apply(this.coll, arguments);
        },

        /* Iterators */

        //Invokes a callback function for each model in the
        //collection with three arguments: the model, the model's
        //index, and the collection object's coll.
        forEach: function forEach(callback){
            this.coll.forEach(function(element, index, coll){
                callback(element, index, coll);
            });
        },
        //Tests whether all models in the collection pass the
        //test implemented by the provided callback.
        every: function every(callback, context){
            return [].every.call(this.coll, callback, context);
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
        //Apply a function against an accumulator and each
        //model in the collection (from left-to-right) as to
        //reduce it to a single value.
        reduce: function(callback, initialValue){
            return [].reduce.call(this.coll, callback, initialValue);
        },
        //Apply a function simultaneously against two models
        //of the collection (from right-to-left) as to reduce
        //it to a single value.
        reduceRight: function(callback, initialValue){
            return [].reduceRight.call(this.coll, callback, initialValue);
        },

        /* Sugar */

        //Sets the readOnly flag on all models
        //in the collection to isReadOnly.
        setReadOnly: function setReadOnly(isReadOnly){
            this.coll.forEach(function(model){
               model.readOnly = isReadOnly;
            });
        },
        //Removes all models from the collection whose data
        //properties matches those of matchingPropertiesHash.
        remove: function remove(matchingPropertiesHash){
            var newColl;
            if(isNotAnObjectOrIsAnArray(matchingPropertiesHash)){
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
            if(isNotAnObjectOrIsAnArray(matchingPropertiesHash)){
                return false;
            }
            return this.coll.some(function(el){
                return isMatch(el.data, matchingPropertiesHash);
            });
        },
        //Returns all the models whose data properties
        //match those of matchingPropertiesHash.
        find: function find(matchingPropertiesHash){
            if(isNotAnObjectOrIsAnArray(matchingPropertiesHash)){
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
        }
    };

    Coccyx.collections = {
        extend: extend
    };

});
