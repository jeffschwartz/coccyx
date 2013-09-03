//0.6.0
define('eventer', ['jquery'], function($){
    'use strict';

    //A custom non-dom  based "eventer" based on jQuery's .on() method's ability to use any object as an 'eventer' to generate custom events
    //and to handle emitted custom events. Use this to add eventing to your own objects.

    var Coccyx = window.Coccyx = window.Coccyx || {},
        proto;

    proto = {
        //Attach a callback handler to a specific custom event or events fired from 'this' object optionally binding the callback to context.
        handle: function handle(events, callback, context){
            $(this).on(events, context? $.proxy(callback, context) : callback);
        },
        //Like handle but will only fire the event one time and will ignore subsequent events.
        handleOnce: function handleOnce(events, callback, context){
            $(this).one(events, context? $.proxy(callback, context) : callback);
        },
        //Removes the handler.
        removeHandler: function removeHandler(events, callback){
            $(this).off(events, callback);
        },
        //Fire an event for object optionally passing args if provide.
        emitEvent: function emitEvent(events, args){
            $(this).trigger(events, args);
        }
    };

    function extend(obj){
        return Coccyx.helpers.extend(Object.create(proto), obj);
    }

    Coccyx.eventer = {
        extend: extend
    };

    //Used by models and collections internally.
    Coccyx.eventer.proto = proto;

});
