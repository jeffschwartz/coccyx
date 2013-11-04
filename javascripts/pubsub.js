define('pubsub', ['helpers'], function(){
    /**
     * A purely hash-based backed pubsub implementation.
     */
    'use strict';

    var v = window.Coccyx = window.Coccyx || {},
        subscribers = {},
        totalSubscribers = 0,
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

    //0.6.0 Returns a function which wraps subscribers callback in a setTimeout callback.
    function genAsyncCallback(topic, callback){
        return function(topic, data){
            setTimeout(function(){
                callback(topic, data);
            }, 1);
        };
    }

    //0.6.0 added async callback. if options.async is false then the callback will be done synchronously.
    //0.6.0 options hash as optional 3rd argument.
    function subscribe(topic, handler/*, options*/){
        var token = generateToken(),
            defaultOptions = {context: null, async: true},
            options = arguments.length === 3 ? v.helpers.extend({}, defaultOptions, arguments[2]) : defaultOptions,
            callback = options.context ? handler.bind(options.context) : handler;
        callback = options.async ? genAsyncCallback(topic, callback) : callback;
        if(!subscribers.hasOwnProperty(topic)){
            subscribers[topic] = {};
        }
        subscribers[topic][token] = callback;
        totalSubscribers++;
        return token;
    }

    function unsubscribe(topic, token){
        if(subscribers.hasOwnProperty(topic)){
            if(subscribers[topic].hasOwnProperty(token)){
                delete subscribers[topic][token];
                totalSubscribers--;
            }
        }
    }

    function publish(topic, data){
        var token;
        if(subscribers.hasOwnProperty(topic)){
            for(token in subscribers[topic] ){
                if(subscribers[topic].hasOwnProperty(token)){
                    if(data){
                        subscribers[topic][token](topic, data);
                    }else{
                        subscribers[topic][token](topic);
                    }
                }
            }
        }
    }

    //0.6.0 Might be useful to have for testing.
    function getCountOfSubscribers(){
        return totalSubscribers;
    }

    //0.6.0 Might be useful to have for testing.
    function getCountOfSubscribersByTopic(topic){
        var prop,
            count = 0;
        if(subscribers.hasOwnProperty(topic)){
            for(prop in subscribers[topic]){
                if(subscribers[topic].hasOwnProperty(prop)){
                    count++;
                }
            }
        }
        return count;
    }

    v.pubsub = {
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        publish: publish,
        getCountOfSubscribers: getCountOfSubscribers,
        getCountOfSubscribersByTopic: getCountOfSubscribersByTopic
    };

});
