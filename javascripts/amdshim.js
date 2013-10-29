(function(){
    'use strict';
    if(!(typeof define  === 'function' && define.amd)) {
        window.define =  function define(){
            (arguments[arguments.length - 1])();
        };
    }
}());
