//0.6.0
define('eventer', ['application', 'helpers'], function(){
    'use strict';

    //Coccyx.eventer turns any object into an "eventing" object and is based on jQuery's eventing model.
    //Example: v.eventer.extend(someObjet); someObject.handle('ping', callback); ... someObject.trigger('ping');

    var v = window.Coccyx = window.Coccyx || {}, eventerApi;

    eventerApi = {
        //Attach a callback handler to a specific custom event or events fired from 'this' object optionally binding the callback to context.
        handle: function handle(events, callback, context){
            v.$(this._eventedObj).on(events, context? v.$.proxy(callback, context) : callback);
        },
        //Like handle but will only fire the event one time and will ignore subsequent events.
        handleOnce: function handleOnce(events, callback, context){
            v.$(this._eventedObj).one(events, context? v.$.proxy(callback, context) : callback);
        },
        //Removes event handler.
        off: function off(events, callback){
            if(events && callback){
                v.$(this._eventedObj).off(events, callback);
            }else if(events){
                //0.6.3 removes all event handlers for events
                v.$(this._eventedObj).off(events);
            }else{
                //0.6.3 removes all event handlers for all events
                v.$(this._eventedObj).off();
            }
        },
        //Trigger an event for object optionally passing args if provided.
        trigger: function trigger(events, args){
            v.$(this._eventedObj).trigger(events, args);
        }
    };

    function extend(obj){
        //0.6.3 Implementation now placed directly on obj instead of added as a prototype.
        var obj0 = obj._eventedObj ? obj : v.helpers.extend(obj, eventerApi);
        //0.6.3 Add eventedObj to obj.
        obj0._eventedObj = obj._eventedObj ? obj._eventedObj : {};
        return obj0;
    }

    v.eventer = {extend: extend};
});
