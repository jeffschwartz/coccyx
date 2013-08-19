define('views', ['jquery'], function($){
    'use strict';

    var Coccyx = window.Coccyx = window.Coccyx || {},
        domEventTopic = 'DOM_EVENT',
        proto;

    //0.6.0
    //Wire view dom events to callback methods in the controller
    //using the context of the controller when calling the callbacks.
    //domEventsHash = {controller: controller, events: {'event selector': callback, ...}}.
    function wireDomEvents(domEventsHash, $domTarget, namespace){
        var prop;
        var a;
        for(prop in domEventsHash.events){
            if(domEventsHash.events.hasOwnProperty(prop)){
                a = prop.split(' ');
                $domTarget.on(a[0] + namespace, a[1],
                    domEventsHash.events[prop].bind(domEventsHash.controller));
            }
        }
    }

    //0.6.0
    function remove(viewObject){
        viewObject.$domTarget.off(viewObject.namespace);
    }

    //0.5.0, 0.6.0
    function extend(viewObject, domEventsHash){
        // Create a new object using the view object as its prototype.
        var obj1 =  Coccyx.helpers.extend(Object.create(proto), viewObject);
        var obj2 = Object.create(obj1);
        obj2.$domTarget = viewObject.hasOwnProperty('domTarget') ? $(viewObject.domTarget) : undefined;
        if(domEventsHash){
            obj2.namespace = '.' + Date.now().toString();
            wireDomEvents(typeof domEventsHash === 'function' ? domEventsHash() : domEventsHash, obj2.$domTarget, obj2.namespace);
        }
        return obj2;
    }

    //0.6.0
    proto = {
        remove: function(){
            this.$domTarget.off(this.namespace);
            this.$domTarget.empty();
        },
        $: $
    };

    Coccyx.views = {
        extend: extend,
        remove: remove,
        domEventTopic: domEventTopic
    };

});
