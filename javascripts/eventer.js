//0.6.0
define('eventer', ['helpers', 'application'], function(){
    'use strict';

    //Coccyx.eventer turns any object into an "eventing" object and is based on jQuery's eventing model.
    //Example: v.eventer.extend(someObjet); someObject.handle('ping', callback); ... someObject.trigger('ping');

    var v = window.Coccyx = window.Coccyx || {}, eventerApi, uniqueNamespace = v.helpers.uniqueNamespace;

    //0.6.5 Eventer duck typing - an object is considered to be an Eventer if it has an _eventedObj property and _eventerObj has namespace and listeners properties.
    function isEventer(obj){return obj && obj._eventedObj && obj._eventedObj.namespace && obj._eventedObj.listeners;}

    //0.6.5
    function getListeners(eventer){return eventer._eventedObj.listeners;}

    //0.6.5
    function getNamespace(eventer){return eventer._eventedObj.namespace;}

    //0.6.5 Adds event info to this object's _eventedObj.listeners property.
    function addListener(self, listeningToObj, events, callback){
        events.split(' ').forEach(function(event){getListeners(self).push({listeningToObj: listeningToObj, event: event, callback: callback});});
    }

    //0.6.5
    function addNamespaceToEvents(self, events){
        if(!events){return;}
        var namespace = getNamespace(self), namespaced = '';
        events.split(' ').forEach(function(event){if(namespaced.length){namespaced += ' ';} namespaced += event + '.' + namespace;});
        return namespaced;
    }

    //0.6.5
    function removeEvent(obj, event, callback){v.$(obj._eventedObj).off(event, callback);}

    //0.6.5
    function removeListeners(self, options){
        var ll = getListeners(self), lto = options.listeningToObj, event = options.event, callback = options.callback;
        self._eventedObj.listeners = ll.filter(function(l){
            if((lto && event && callback) && (lto !== l.listeningToObj || event !== l.event || callback !== l.callback)){return true;}
            if((lto && event && !callback) && (lto !== l.listeningToObj || event !== l.event)){return true;}
            if((lto && !event && callback) && (lto !== l.listeningToObj || callback !== l.callback)){return true;}
            if((lto && !event && !callback) && (lto !== l.listeningToObj)){return true;}
            if((!lto && event && callback) && (event !== l.event || callback !== l.callback)){return true;}
            if((!lto && event && !callback) && (event !== l.event)){return true;}
            if((!lto && !event && callback) && (callback !== l.callback)){return true;}
            removeEvent(l.listeningToObj, l.event, l.callback);
            return false;
        });
    }

    //0.6.5
    function cleanupListeners (self, options) {
        var lto = options.listeningToObj, events = options.events, callback = options.callback;
        if(events){events.split(' ').forEach(function(e){removeListeners(self, {listeningToObj: lto, event: e, callback: callback});});}
        else{removeListeners(self, {listeningToObj: lto, event: events, callback: callback});}
    }

    //0.6.5 Creates a proxy of the callback that removes the event it is responding to and then calls the callback.
    function proxyOnce(self, listeningToObj, event, callback){
        return function(){callback.apply(self, [].slice.call(arguments)); cleanupListeners(self, {listeningToObj: listeningToObj, events: event, callback: callback});};
    }

    eventerApi = {
        //Attach a callback handler to a specific custom event or events fired from 'this' object optionally binding the callback to context.
        handle: function handle(events, callback, context){v.$(this._eventedObj).on(events, context? v.$.proxy(callback, context) : callback);},
        //Like handle but will only fire the event one time and will ignore subsequent events.
        handleOnce: function handleOnce(events, callback, context){v.$(this._eventedObj).one(events, context? v.$.proxy(callback, context) : callback);},
        //Removes event handler.
        off: function off(events, callback){
            if(events && callback){v.$(this._eventedObj).off(events, callback);}
            else if(events){v.$(this._eventedObj).off(events);}
            else{v.$(this._eventedObj).off();}
        },
        //Trigger an event for object optionally passing args if provided.
        trigger: function trigger(events, args){v.$(this._eventedObj).trigger(events, args);},
        //0.6.5
        listenTo: function(obj, events, callback){
            var namespacedEvents = '';
            if(!obj || !events || !callback || !isEventer(obj)){return;}
            namespacedEvents = addNamespaceToEvents(this, events);
            v.$(obj._eventedObj).on(namespacedEvents, v.$.proxy(callback, this));
            addListener(this, obj, namespacedEvents, callback);
        },
        //0.6.5
        listenToOnce: function(obj, event, callback){
            var namespacedEvent = '';
            if(!obj || !event || !callback || !isEventer(obj)){return;}
            namespacedEvent = addNamespaceToEvents(this, event);
            v.$(obj._eventedObj).one(namespacedEvent, v.$.proxy(proxyOnce(this, obj, namespacedEvent, callback), this));
            addListener(this, obj, namespacedEvent, callback);
        },
        //0.6.5 obj is the object this object is listening to. options is a hash with properties events and callback.
        stopListeningTo: function(obj, options){
            var opts = options || {};
            opts.listeningToObj = obj;
            opts.events = options && options.events && addNamespaceToEvents(this, options.events);
            cleanupListeners(this, opts);
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
        obj0._eventedObj.listeners = [];
        return obj0;
    }

    v.eventer = {extend: extend};
});
