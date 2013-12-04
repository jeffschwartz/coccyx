define('views', ['helpers', 'application'], function(){
    'use strict';

    var v = window.Coccyx = window.Coccyx || {}, domEventTopic = 'DOM_EVENT', uniqueNamespace = v.helpers.uniqueNamespace, proto;

    //0.6.0.
    //0.6.5 Renamed domEventsHash.controller to domEventsHash.context.
    //Wire view dom events to callback methods in the controller or view (as of 0.6.5) using the context of the controller or view
    //(as of 0.6.5) when calling the callbacks. domEventsHash = {context: [controller || view], events: {'event selector': callback[, ...]}}.
    function wireDomEvents(domEventsHash){
        /*jshint validthis:true*/
        var prop, a;
        for(prop in domEventsHash.events){
            if(domEventsHash.events.hasOwnProperty(prop)){a = prop.split(' '); this.$domTarget.on(a[0] + this.namespace, a[1], domEventsHash.events[prop].bind(domEventsHash.context || this));}
        }
    }

    //0.6.0
    //Every view must have a domTarget property, which is used to render the view. Views can be rendered in 1 of 2 ways, either
    //"detached" or "attached" to the DOM. To render as detached, provide either a tagName property ('div', 'section', 'article',
    //'span', etc.) and a domTargetAttrs property (a hash, that can contain an id property, a class property and other element
    //attributes as properties), or set the domTarget property (either a string, whose value would be appropriate for calling
    //document.createElement(domTarget), or a callback to a function that returns a string appropriate for calling
    //document.createElement(domTarget)) yourself, or omit domTarget and domTargetAttrs altogether and a default domTarget will be
    //provided for you, which will be a plain "<div>" element. To render as attached, set $domTarget to a valid jquery object and
    //domTarget will be created for you from $domTarget.
    function setTarget(){
        /*jshint validthis:true*/
        if(this.$domTarget && this.$domTarget instanceof v.$){
            //Use $domTarget.
            this.domTarget = this.$domTarget[0];
        }else if(this.domTarget){
            //Use domTarget.
            this.domTarget = document.createElement(typeof this.domTarget === 'string' ? this.domTarget : this.domTarget());
            this.$domTarget = v.$(this.domTarget);
        }else if(this.domTargetAttrs){
            //Use domTargetAttrs.
            this.$domTarget = v.$(document.createElement(this.tagName ? this.tagName : 'div')).attr(this.domTargetAttrs);
            this.domTarget = this.$domTarget[0];
        }else{
            //Default to 'div'.
            this.domTarget = document.createElement('div');
            this.$domTarget = v.$(this.domTarget);
        }
    }

    //0.5.0, 0.6.0, 0.6.5.
    function extend(viewObject, domEventsHash){
        //Create a new object using the view object as its prototype.
        var obj1 =  v.helpers.extend(Object.create(proto), viewObject), obj2 = Object.create(obj1);
        //0.6.0 Set domTarget && $domTarget
        setTarget.call(obj2);
        //0.6.0 Wire up events, if any are declared.
        if(domEventsHash){
            obj2.namespace = '.view_' + uniqueNamespace();
            //0.6.5 domEventsHash can now also be an array.
            if(Array.isArray(domEventsHash)){
                domEventsHash.forEach(function(deh){
                    wireDomEvents.call(obj2, typeof deh === 'function' ? deh() : deh);
                });
            }
            wireDomEvents.call(obj2, typeof domEventsHash === 'function' ? domEventsHash() : domEventsHash);
        }
        return obj2;
    }

    proto = {remove: function remove(){this.$domTarget.off(this.namespace); this.$domTarget.empty(); }, $: v.$};

    v.views = {extend: extend, domEventTopic: domEventTopic};
});
