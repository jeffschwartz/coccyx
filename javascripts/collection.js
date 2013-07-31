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
        return obj2;
    }

    //Returns true if element has the same properties as
    //source and their values are equal, false otherwise.
    function isMatch(element, source){
        var prop;
        for(prop in source){
            if(source.hasOwnProperty(prop) && element.hasOwnProperty(prop)){
                if(typeof element[prop] === 'object' && typeof source[prop] === 'object'){
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

    //Collection prototype properties...
    proto = {
        //Sets the collection to [models].
        setModels: function setModels(models, isReadOnly){
            this.add(models);
            this.readOnly = !!isReadOnly;
        },
        //Push each element
        //in [models] to the collection.
        add: function add(models){
            if(Array.isArray(models)){
                models.forEach(function(model){
                    this.coll.push(model);
                }, this);
            }else{
                this.coll.push(models);
            }
        },
        //Removes all elements from the collection whose
        //properties matches those of matchingPropertiesHash.
        remove: function remove(matchingPropertiesHash){
            var newColl = this.coll.filter(function(el){
                return !isMatch(el, matchingPropertiesHash);
            });
            this.coll = newColl.length !== this.coll.length ? newColl : this.coll;
        },
        //Returns true if the coll has at least one element whose
        //properties matches those of matchingPropertiesHash.
        has: function has(matchingPropertiesHash){
            return this.coll.some(function(el){
                return isMatch(el, matchingPropertiesHash);
            });
        },
        //Returns the elements whose properties
        //match those of matchingPropertiesHash.
        find: function find(matchingPropertiesHash){
            return this.coll.filter(function(el){
                return isMatch(el.data, matchingPropertiesHash);
            });
        },
        toJSON: function toJSON(){
            return JSON.stringify(this.coll);
        }
    };


    Coccyx.collections = {
        extend: extend
    };

});
