define('router', ['application', 'helpers'], function() {
    'use strict';

    var v = window.Coccyx = window.Coccyx || {}, contains = v.helpers.contains;

    function route(verb, url, valuesHash){
        //0.6.1 Call Coccyx.init() only once before handling any routing requests. See application.js for details.
        if(!v.initCalled){
            v.init();
            v.initCalled = true;
            console.log('Coccyx.init called');
        }
        var rt = getRoute(verb, url);
        if(rt){
            routeFound(rt, valuesHash);
        }else{
            routeNotFound(verb, url);
        }
    }

    function getRoute(verb, url){
        var routes = v.controllers.getRoutes(),
            a = url.substring(1).split('/'),
            params = [],
            rel = false,
            route, b, c, eq, vrb;
        for(route in routes){
            if(routes.hasOwnProperty(route)){
                //Get the 'veb'.
                vrb = route.substring(0, route.indexOf(' '));
                //Get the url.
                b = route.substring(route.indexOf('/') + 1).split('/');
                if(verb === vrb && (a.length === b.length || contains(route, '*'))){
                    eq = true;
                    //The url and the route have the same number of segments so the route can be either static or it could contain parameterized segments.
                    for(var i = 0, len = b.length; i < len; i++){
                        //If the segments are equal then continue looping.
                        if(a[i] === b[i]){continue;}
                        //If the route segment is parameterized then save the parameter and continue looping.
                        if(contains(b[i],':')){
                            //0.4.0 - checking for 'some:thing'
                            c = b[i].split(':');
                            if(c.length === 2){
                                if(a[i].substr(0, c[0].length) === c[0]){params.push(a[i].substr(c[0].length));}
                            }else{
                                params.push(a[i]);
                            }
                            continue;
                        }
                        //If the route is a relative route, push it onto the array and break out of the loop.
                        if(contains(b[i], '*')){
                            rel = true;
                            eq = false;
                            break;
                        }
                        //If none of the above
                        eq = false;
                        break;
                    }
                    //The route matches the url so attach the params (it could be empty) to the route and return the route.
                    if(eq){
                        //controller name, function to call, function arguments to call with...
                        return {controllerName: /*b[0]*/ routes[route][0], fn: routes[route][1], params: params};
                    }
                    if(rel){
                        //controller name, function to call, function arguments to call with...
                        for(var ii = i, llen = a.length, relUrl = ''; ii < llen; ii++){relUrl += ('/' + a[ii]);}
                        //controller name, function to call, function arguments to call with...
                        return {controllerName: /*b[0]*/ routes[route][0], fn: routes[route][1], params: [relUrl]};
                    }
                }
            }
        }
    }

    function routeFound(route, valuesHash){
        //0.6.0 Prior versions called controller.init() when the controller is loaded. Starting with 0.6.0,
        //controller.init() is only called when routing is called to one of their route callbacks. This
        //eliminates unnecessary initialization if the controller is never used.
        var controller = v.controllers.getController(route.controllerName);
        if(controller.hasOwnProperty('init') && !controller.hasOwnProperty('initCalled')){
            controller.init();
            controller.initCalled = true;
        }
        //Route callbacks are bound (their contexts (their 'this')) to their controllers.
        if(valuesHash){
            route.fn.call(controller, valuesHash);
        }else if(route.params.length){
            route.fn.apply(controller, route.params);
        }else{
            route.fn.call(controller);
        }
    }

    function routeNotFound(url){console.log('router::routeNotFound called with route = ' + url);}

    v.router = {route: route};
});
