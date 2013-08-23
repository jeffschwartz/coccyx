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
    //Every view must have a domTarget property, which is used to render the view.
    //Views can be rendered in 1 of 2 ways, either "detached" or "attached" to the DOM.
    //To render as detached, provide either a tagName property ('div', 'section', 'article',
    //'span', etc.) and a domTargetAttrs property (a hash, that can contain an id property, a class
    //property and other element attributes as properties), or set the domTarget property (either
    //a string, whose value would be appropriate for calling document.createElement(domTarget),
    //or a callback to a function that returns a string appropriate for calling
    //document.createElement(domTarget)) yourself, or omit domTarget and domTargetAttrs altogether
    //and a default domTarget will be provided for you, which will be a plain "<div>" element.
    //To render as attached, set $domTarget to a valid jquery object and domTarget will be created
    //for you from $domTarget.
    function setTarget(){
        /*jshint validthis:true*/
        var tmp;
        if(this.$domTarget && this.$domTarget instanceof Coccyx.$){
            //Use $domTarget to create domTarget if $domTarget is provided.
            this.domTarget = this.$domTarget[0];
        }else if(this.domTarget){
            //Was domTarget provided as a string value?
            if(typeof this.domTarget === 'string'){
                this.$domTarget = document.createElement(this.domTarget);
            }
            //Was domTarget provided as a callback?
            if(typeof this.domTarget === 'function'){
                this.$domTarget = this.domTarget();
            }
        }else if(this.domTargetAttrs){
            tmp = this.tagName ? '<' + this.tagName + '>' : '<div>';
            this.$domTarget = Coccyx.$(tmp).attr(this.domTargetAttrs);
        }else{
            this.domTarget = document.createElement('div');
            this.$domTarget = Coccyx.$(this.domTarget);
        }
    }

    //0.5.0, 0.6.0
    function extend(viewObject, domEventsHash){
        // Create a new object using the view object as its prototype.
        var obj1 =  Coccyx.helpers.extend(Object.create(proto), viewObject);
        var obj2 = Object.create(obj1);
        //0.6.0 Set domTarget && $domTarget
        setTarget.call(obj2);
        //0.6.0 Wire up events, if any are declared.
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
        domEventTopic: domEventTopic
    };

});
