//0.6.0
define('eventer', ['helpers', 'application'], function(){
    'use strict';

    //Coccyx.eventer turns any object into an "eventing" object and is based on jQuery's eventing model.
    //Example: v.eventer.extend(someObjet); someObject.handle('ping', callback); ... someObject.trigger('ping');

    var v = window.Coccyx = window.Coccyx || {}, eventerApi, uniqueNamespace = v.helpers.uniqueNamepspace, extObj = v.helpers.extend, listenersProto, listernerProto;

    //0.6.5 Eventer duck typing - an object is considered to be an Eventer if it has an _eventedObj property and _eventerObj has namespace and listeners properties.
    function isEventer(obj){return obj && obj._eventedObj && obj._eventedObj.namespace && obj._eventedObj.listeners;}

    //0.6.5
    function getListeners(eventer){return eventer._eventedObj.listeners;}

    //0.6.5
    function getListener(eventer, namespace){if(eventer._eventedObj.hasOwnProperty(namespace)){return eventer._eventedObj[namespace];}}

    //0.6.5
    function getNamespace(eventer){return eventer._eventedObj.namespace;}

    //0.6.5
    function getEventedObj(eventer){return eventer._eventedObj;}

    //0.6.5
    listenersProto = {
        removeProperty: function removeProperty(namespace){
            if(this.hasOwnProperty(namespace) && !this[namespace].events.length){
                delete this[namespace];
            }
        },
        removeAllProperties: function removeAllProperties(){
            for(var prop in this){
                if(this.hasOwnProperty(prop)){
                    this.removeProperty(prop);
                }
            }
        }
    };

    //0.6.5
    function createListeners(){
        return Object.create(listenersProto);
    }

    //0.6.5
    listernerProto = {
        addEvent: function addEvent(event, callback){
            var self = this;
            event.split(' ').forEach(function(e){
                self.events.push({event: e, callback: callback});
            });
        },
        removeEvent: function removeEvent(options){
            this.events = this.events.filter(function(obj){
                if(options.event && options.callback){
                    return obj.event !== options.event && obj.callback !== options.callback;
                }else if(options.event){
                    return obj.event !== options.event;
                }else if(options.callback){
                    return obj.callback !== options.callback;
                }
            });
        }
    };

    //0.6.5 Create listener object with properties listenToNamespace (listeningToObj's _eventedObj.namespace),
    //listeningToObj (the object on which events are placed) & events (an array event names).
    function createListener(listeningToObj){
        return extObj(Object.create(listernerProto), {listeningToNamespace: getNamespace(listeningToObj), listeningToObj: listeningToObj, events: []});
    }

    //0.6.5 Maintains this object's _eventedObj.listeners property which is a hash whose own properties are of the form:
    //[namespace of other object's evented object] : [an array whose elements are the events being listened to].
    function addListener(self, listeningToObj, events, callback){
        var listener = self._eventedObj.listeners[getNamespace(listeningToObj)] =
            self._eventedObj.listeners[getNamespace(listeningToObj)] || createListener(listeningToObj);
        listener.addEvent(event, callback);
    }

    //0.6.5 Creates a proxy of the callback that removes the event it is responding to from listener.events and then calls the callback.
    function proxyOnce(self, listeningToObj, event, callback){
        var listener = getListener(self, getNamespace(listeningToObj));
        return function(){
            //Remove this event from this object's _eventedObj.listeners.
            listener.removeEvent(event, callback);
            //Remove the listener if listener.events is empty.
            getListeners(self).removeProperty(getNamespace(listeningToObj));
            //Call the callback using this as context and passing it arguments.
            callback.apply(self, [].slice.call(arguments));
        };
    }

    //0.6.5
    //Options is a hash with properties listeningToObj, event and callback.
    function removeListener(self, options){
        var prop;
        if(!options.listeningToObj && !options.event && !options.callback){
            //Remove all events on all objects by this object's namespace.
            for(prop in getListeners(self)){
                if(getListeners(self).hasOwnProperty(prop)){
                    v.$(getListeners(self)[prop].listeningToObj).off('.' + getNamespace(self));
                }
            }
            //Remove all listener objects from listeners.
            getListeners(self).removeAllProperties();
        }else if(!options.listeningToObj && options.event && options.callback){
            //Remove all events on all objects by event + namespace and callback.

        }else if(!options.listeningToObj && options.event && !optios.callback){
            //Remove all events on all objects by event + namespace.

        }else if(!options.listeningToObj && !options.event && options.callback){
            //Remove all events on all objects by namespace and callback.

        }else if(options.listeningToObj && !options.event && !options.callback){
            //Remove all events on one object by this object's namespace.
            v.$(options.listeningToObj).off('.' + getNamespace(self));
            //Remove the listener object from listeners.
            getListeners(self).removeProperty(getNamespace(options.listeningToObj));
        }else if(options.listeningToObj && options.event && options.callback){
            //Remove events on one object by event + this object's namespace and callback.
            options.event.split(' ').forEach(function(ev){
                //Remove the event on one object.
                v.$(options.listeningToObj).off(ev + '.' + getNamespace(self), options.callback);
                //Remove the event from listener.events.
                getListeners(self)[getNamespace(options.listeningToObj)].removeEvent({event: options.event, callback: options.callback});
                //Remove the listener object from listeners if it is empty.
                getListeners(self).removeProperty(getNamespace(options.listeningToObj));
            });
        }else if((options.listeningToObj && options.event && !options.callback)){
            //Remove events on one object by event + this object's namespace
            options.event.split(' ').forEach(function(ev){
                //Remove the event on one object.
                v.$(options.listeningToObj).off(ev + '.' + getNamespace(self));
                //Remove the event from listener.events.
                getListeners(self)[getNamespace(options.listeningToObj)].removeEvent({event: options.event});
                //Remove the event from listener.events.
                getListeners(self).removeProperty(options.listeningToObj);
            });
        }else if((options.listeningToObj && !options.event && options.callback)){
            //Remove events on one object by namespace and callback.
            v.$(options.listeningToObj).off('.' + getNamespace(self), options.callback);
            //Remove the event from listener.events.
            getListeners(self)[getNamespace(options.listeningToObj)].removeEvent({callback: options.callback});
            //Remove the event from listener.events.
            getListeners(self).removeProperty(options.listeningToObj);
        }
        // var listeners = getListeners(self), listeningToNamespace, prop, objs;
        // listeningToNamespace = listeningToObj && getNamespace(listeningToObj);
        // if(listeningToObj){
        //     if(listeners.hasOwnProperty(listeningToNamespace)){
        //         if(event && callback){
        //             v.$(listeningToObj).off(event, callback);
        //             listeners[listeningToNamespace] = listeners[listeningToNamespace].filter(function(listener){
        //                 return listener.event !== event || listener.callback !== callback;
        //             });
        //         }else if(event){
        //             v.$(listeningToObj).off(event);
        //             listeners[listeningToNamespace] = listeners[listeningToNamespace].filter(function(listener){
        //                 return listener.event !== event;
        //             });
        //         }else if(callback){
        //             v.$(listeningToObj).off(callback);
        //             listeners[listeningToNamespace] = listeners[listeningToNamespace].filter(function(listener){
        //                 return listener.callback !== callback;
        //             });
        //         }else{
        //             listeners[listeningToNamespace].forEach(function(listener){
        //                 v.$(getEventedObj(listeningToObj)).off(listener.event, listener.callback);
        //             });
        //         }
        //     }
        // }else{
        //     if(event && callback){
        //         for(prop in listeners){
        //             if(listeners.hasOwnProperty(prop)){
        //             }
        //         }
        //     }else if(event){
        //         //
        //     }else{
        //         //
        //     }
        // }
    }

    eventerApi = {
        //Attach a callback handler to a specific custom event or events fired from 'this' object optionally binding the callback to context.
        handle: function handle(events, callback, context){v.$(this._eventedObj).on(events, context? v.$.proxy(callback, context) : callback);},
        //Like handle but will only fire the event one time and will ignore subsequent events.
        handleOnce: function handleOnce(events, callback, context){v.$(this._eventedObj).one(events, context? v.$.proxy(callback, context) : callback);},
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
        trigger: function trigger(events, args){v.$(this._eventedObj).trigger(events, args);},
        //0.6.5
        listenTo: function(obj, events, callback){
            var namespace = getNamespace(this), namespacedEvents;
            if(!isEventer(obj)){return;}
            if(Array.isArray(events)){namespacedEvents = events.map(function(event){ return event + '.' + namespace;});}
            else{namespacedEvents = events + '.' + namespace;}
            v.$(obj._eventedObj).on(namespacedEvents, v.$.proxy(callback, this));
            addListener(this, obj, events, callback);
        },
        //0.6.5
        listenToOnce: function(obj, event, callback){
            if(!isEventer(obj)){return;}
            v.$(obj._eventedObj).one(event + '.' + getNamespace(this), v.$.proxy(proxyOnce(this, obj, event, callback), this));
            addListener(this, obj, event, callback);
        },
        //0.6.5 Options is a hash with properties listeningToObj, event and callback.
        stopListening: function(options){
            removeListener(this, options);
        }

    };

    function extend(obj){
        //0.6.3 Implementation now placed directly on obj instead of added as a prototype.
        var obj0 = obj._eventedObj ? obj : v.helpers.extend(obj, eventerApi);
        //0.6.3 Add eventedObj to obj.
        obj0._eventedObj = obj._eventedObj ? obj._eventedObj : {};
        //0.6.5 Added namespace.
        obj0._eventedObj.namespace = 'eventer_' + uniqueNamespace();
        //0.6.5 Added listeners.
        obj0._eventedObj.listeners = createListeners();
        return obj0;
    }

    v.eventer = {extend: extend};
});
