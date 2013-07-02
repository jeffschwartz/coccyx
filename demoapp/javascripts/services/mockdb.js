(function(){
    "use strict";

    var demoapp = window.demoapp = window.demoapp || {};

    var introduction = "Coccyx is a tiny, slightly opinionated MVC library that promotes ease of use, modern work flow and best practices.";

    var api = {
        controllers: {}
    };

    function getApiBySubject(subject){
        return api[subject];
    }

    demoapp.mockdb = {
        getApiBySubject: getApiBySubject
    };

}());