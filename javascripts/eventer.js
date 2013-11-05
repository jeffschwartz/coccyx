//0.6.0
define('eventer', ['application', 'helpers'], function(){
    'use strict';

    //A custom non-dom  based "eventer" based on jQuery's .on() method's ability to use any object as an 'eventer' to generate custom events
    //and to handle emitted custom events. Use this to add eventing to your own objects.

    var v = window.Coccyx = window.Coccyx || {},
        proto;

    proto = {
        //Attach a callback handler to a specific custom event or events fired from 'this' object optionally binding the callback to context.
        handle: function handle(events, callback, context){
            v.$(this).on(events, context? v.$.proxy(callback, context) : callback);
        },
        //Like handle but will only fire the event one time and will ignore subsequent events.
        handleOnce: function handleOnce(events, callback, context){
            v.$(this).one(events, context? v.$.proxy(callback, context) : callback);
        },
        //Removes event handler.
        off: function off(events, callback){
            if(events && callback){
                //0.6.0 removes a specific event handler for events
                v.$(this).off(events, callback);
            }else if(events){
                //0.6.3 removes all event handlers for events
                v.$(this).off(events);
            }else{
                //0.6.3 removes all event handlers for all events
                v.$(this).off();
            }
        },
        //Trigger an event for object optionally passing args if provided.
        trigger: function trigger(events, args){
            v.$(this).trigger(events, args);
        }
    };

    function extend(obj){
        return v.helpers.extend(Object.create(proto), obj);
    }

    v.eventer = {
        extend: extend,
        proto: proto
    };

});
