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
        deepCopy: function deepCopy(o){return JSON.parse(JSON.stringify(o));},
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
