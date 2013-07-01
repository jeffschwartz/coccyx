(function(){
    "use strict";

    var Coccyx = window.Coccyx = window.Coccyx || {};

    Coccyx.helpers = {
        contains: function(s1, s2){
            var i, len;
            if(typeof s1 === "string"){
                for(i = 0, len = s1.length; i < len; i++){
                    if(s1[i] === s2) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
}());