define('views', ['jquery'], function($){
    'use strict';

    var Coccyx = window.Coccyx = window.Coccyx || {},
        domEventTopic = 'DOM_EVENT';

    //0.6.0
    function domEventDispatcher(event){
        Coccyx.pubsub.publish(domEventTopic, {viewName: event.data.viewName, event: event});
    }

    //0.6.0
    //domEventsHash = {viewName: 'viewname', events['event selector',...]}.
    function wireDomEvents(viewObject){
        viewObject.domEvents.events.forEach(function(eventDescription){
            var a = eventDescription.split(' ');
            Coccyx.$(viewObject.domTarget).on(a[0], a[1], {viewName: viewObject.domEvents.viewName, eventType: a[0], eventSelector: a[1]}, domEventDispatcher);
        });
    }

    //0.5.0
    function extend(viewObject){
        // Create a new object using the view object as its prototype.
        var obj =  Object.create(viewObject);
        // Decorate the new object with additional properties.
        obj.$ = $;
        //0.6.0
        obj.$domTarget = viewObject.hasOwnProperty('domTarget') ? $(viewObject.domTarget) : undefined;
        //0.6.0
        if(viewObject.hasOwnProperty('domEvents')){
            wireDomEvents(viewObject);
        }
        return obj;
    }

    Coccyx.views = {
        extend: extend,
        domEventTopic: domEventTopic
    };

});
