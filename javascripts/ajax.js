define('ajax', ['application'], function(){
    'use strict';

    var v = window.Coccyx = window.Coccyx || {},
        extend = v.helpers.extend,
        defaultSettings = {cache: false, url: '/'},
        ajax = v.$.ajax;

        //Merge default setting with user's settings.
        function mergeSettings(settings, type){
            settings.type = type;
            return extend({}, defaultSettings, settings);
        }

    //A simple promise-based wrapper around jQuery Ajax. All methods return a Promise.
    v.ajax = {
        //http "GET"
        ajaxGet: function ajaxGet(settings){
            return ajax(mergeSettings(settings, 'GET'));
        },
        //http "POST"
        ajaxPost: function ajaxPost(settings){
            return ajax(mergeSettings(settings, 'POST'));
        },
        //http "PUT"
        ajaxPut: function ajaxPut(settings){
            return ajax(mergeSettings(settings, 'PUT'));
        },
        //http "DELETE"
        ajaxDelete: function ajaxDelete(settings){
            return ajax(mergeSettings(settings, 'DELETE'));
        }
    };

});
