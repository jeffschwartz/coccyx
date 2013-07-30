define('collections', [], function(){
    'use strict';

    var Coccyx = window.Coccyx = window.Coccyx || {},
        deepCopy = Coccyx.helpers.deepCopy,
        proto;

    //Extend the application's collection object.
    function extend(collectionObject){
        var obj1 = Coccyx.helpers.extend(Object.create(proto), collectionObject);
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
                if(source[prop] !== element[prop]){
                    return false;
                }
            }
        }
        return true;
    }

    //Collection prototype properties...
    proto = {
        //Sets the collection to a deep copy of [models].
        set: function set(models, isReadOnly){
            // Deep copy.
            this.coll = deepCopy(models);
            this.readOnly = !!isReadOnly;
            return true;
        },
        //Pushes a deep copy of each element
        //in [models] to the collection.
        add: function add(models){
            if(Array.isArray(models)){
                models.forEach(function(model){
                    this.coll.push(deepCopy(model));
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
                return isMatch(el, matchingPropertiesHash);
            });
        }

    };

    Coccyx.collections = {
        extend: extend
    };

});
