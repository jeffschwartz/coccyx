define('ajax', ['helpers', 'application'], function(){
    'use strict';

    var v = window.Coccyx = window.Coccyx || {},
        //v0.6.4 added dataType.
        defaultSettings = {dataType: 'json', cache: false, url: '/'},
        extend = v.helpers.extend, ajax = v.$.ajax;

        //Merge default setting with user's settings.
        function mergeSettings(settings, type){
            settings.type = type;
            return extend({}, defaultSettings, settings);
        }

    //A simple promise-based wrapper around jQuery Ajax. All methods return a Promise.
    v.ajax = {
        //http "GET"
        ajaxGet: function ajaxGet(settings){return ajax(mergeSettings(settings, 'GET'));},
        //http "POST"
        ajaxPost: function ajaxPost(settings){return ajax(mergeSettings(settings, 'POST'));},
        //http "PUT"
        ajaxPut: function ajaxPut(settings){return ajax(mergeSettings(settings, 'PUT'));},
        //http "DELETE"
        ajaxDelete: function ajaxDelete(settings){return ajax(mergeSettings(settings, 'DELETE'));}
    };

});
