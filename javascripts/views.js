define('views', ['jquery'], function($){
    'use strict';

    var Coccyx = window.Coccyx = window.Coccyx || {};

    //0.5.0
    function extend(viewObject){
        // Create a new object using the view object as its prototype.
        var obj =  Object.create(viewObject);
        // Decorate the new object with additional properties.
        obj.$ = $;
        return obj;
    }

    Coccyx.views = {
        extend: extend
    };

});
