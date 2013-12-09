define('application', ['jquery'], function(){
    'use strict';

    var v = window.Coccyx = window.Coccyx || {}, VERSION = '0.6.4';

    //Provide jQuery in the Coccyx name space.
    v.$ = jQuery;

    //0.6.1 init will be called only once immediately before the first routing request
    //is handled by the router. Override init to provide application specific initialization,
    //such as bootstrapping your application with data.
    v.init = function init(){};

    //Provide a bucket for Coccyx library plug-ins.
    v.plugins = v.plugins || {};

    //Version stamp.
    v.getVersion = function(){return VERSION;};

});
