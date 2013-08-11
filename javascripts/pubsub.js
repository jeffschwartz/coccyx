define('pubsub', [], function(){
    /**
     * A purely hash-based backed pubsub implementation.
     */
    'use strict';

    var Coccyx = window.Coccyx = window.Coccyx || {},
        subscribers = {},
        lastToken = 0;

    /* subscribers is a hash of hashes {'some topic': {'some token': callbackfunction, 'some token': callbackfunction, . etc. }, . etc } */

    function generateToken(){
        var token;
        while(true){
            token = Date.now().valueOf();
            if(token !== lastToken){
                lastToken = token;
                return token;
            }
        }
    }

    //0.6.0 Returns a function which wraps
    //subscribers callback in a setTimeout callback.
    function genAsyncCallback(callback){
        return function(data){
            setTimeout(function(){
                callback(data);
            }, 1);
        };
    }

    //0.6.0 added async callback. if options.async is false
    //then the callback will be done synchronously.
    //0.6.0 options hash as optional 3rd argument.
    function subscribe(topic, handler/*, options*/){
        var token = generateToken();
        var defaultOptions = {context: null, async: true};
        var options = arguments.length === 3 ? Coccyx.helpers.extend({}, defaultOptions, arguments[2]) : options;
        var callback = options.context ? handler.bind(options.context) : handler;
        callback = options.async ? genAsyncCallback(callback) : callback;
        if(!subscribers.hasOwnProperty(topic)){
            subscribers[topic] = {};
        }
        subscribers[topic][token] = callback;
        return token;
    }

    function unsubscribe(topic, token){
        if(subscribers.hasOwnProperty(topic)){
            if(subscribers[topic].hasOwnProperty(token)){
                delete subscribers[topic][token];
            }
        }
    }

    function publish(topic, data){
        var token;
        if(subscribers.hasOwnProperty(topic)){
            for(token in subscribers[topic] ){
                if(subscribers[topic].hasOwnProperty(token)){
                    if(data){
                        subscribers[topic][token](data);
                    }else{
                        subscribers[topic][token]();
                    }
                }
            }
        }
    }

    //0.6.0 Might be useful to have for testing.
    function getCountOfSubscribers(){
        return subscribers.length;
    }

    Coccyx.pubsub = {
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        publish: publish,
        getCountOfSubscribers: getCountOfSubscribers
    };

});
