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

    //Returns true if element has the same properties as
    //source and their values are equal, false otherwise.
    function isMatch(element, source){
        var prop;
        for(prop in source){
            if(source.hasOwnProperty(prop) && element.hasOwnProperty(prop)){
                if(typeof element[prop] === 'object' && typeof source[prop] === 'object'){
                    //!Recursive iteration...
                    if(!isMatch(element[prop], source[prop])){
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

    //If it walks and talks like a duck...
    //Checks for the following properties on a model's data:
    //['set']
    //['readOnly']
    //['dirty]
    //['originalData']
    //['changedData']
    //['data']
    //If data has all of them then 'it is' a model
    //and returns true, otherwise it returns false.
    function isAModel(data){
        var markers = ['set', 'readOnly', 'dirty', 'originalData', 'changedData', 'data'],
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

        /* Properties */

        /* Mutators */

        //Push [models] onto the collection' data property
        //and returns the length of the collection.
        push: function push(models){
            addModels(this.coll, models);
            this.length = this.coll.length;
            return this.length;
        },
        //Pops the last model from the collection's
        //data property and returns that model.
        pop: function pop(){
            var m = this.coll.pop();
            this.length = this.coll.length;
            return m;
        },
        reverse: function reverse(){
            this.coll.reverse();
        },
        shift: function shift(){
            var m = this.coll.shift();
            this.length = this.coll.length;
            return m;
        },
        unshift: function unshift(){
            var m = [].unshift.apply(this.coll, argumentsToModels(argumentsToModels));
            this.length = this.coll.length;
            return m;
        },
        //Adds and optionally removing models. Takes new
        //[modlels] starting with the 3rd parameter.
        splice: function splice(index, howMany){
            var a =[index, howMany],
                aa = argumentsToModels([].slice.call(arguments, 2));
            a = a.concat(aa);
            var m = [].splice.apply(this.coll, a);
            this.length = this.coll.length;
            return m;
        },
        //Works the same as Array.sort(function(a,b){...})
        sort: function sort(callback){
            this.coll.sort(function(a, b){
                return callback(a, b);
            });
        },

        /* Accessors */

        //Works like array[i].
        at: function(index){
            return this.coll[index];
        },

        /* Iterators */

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
            var newColl = this.coll.filter(function(el){
                return !isMatch(el.data, matchingPropertiesHash);
            });
            this.coll = newColl.length !== this.coll.length ? newColl : this.coll;
            this.length = this.coll.length;
        },
        //Returns true if the coll has at least one model whose
        //data properties matches those of matchingPropertiesHash.
        has: function has(matchingPropertiesHash){
            return this.coll.some(function(el){
                return isMatch(el.data, matchingPropertiesHash);
            });
        },
        //Returns all the models whose data properties
        //match those of matchingPropertiesHash.
        find: function find(matchingPropertiesHash){
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
