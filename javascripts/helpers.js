define('helpers', [], function(){
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
        }
    };

});
