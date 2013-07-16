define("pubsub", [], function(){
    /**
     * A purely hash-based pubsub implementation.
     */
    "use strict";

    var Coccyx = window.Coccyx = window.Coccyx || {},
        subscribers = {},
        lastToken = 0;

    /*
        subscribers is a hash of hashes
        {
            "some topic": {
                "some token": callbackfunction,
                "some token": callbackfunction,
                . etc.
            },
            . etc
        }
    */

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

    function subscribe(topic, handler){
        var token = generateToken();

        if(!subscribers.hasOwnProperty(topic)){
            subscribers[topic] = {};
        }
        subscribers[topic][token] = handler;
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

    Coccyx.pubsub = {
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        publish: publish
    };

});
