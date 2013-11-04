define('ajax', ['application'], function(){
    'use strict';

    var v = window.Coccyx = window.Coccyx || {},
        extend = v.helpers.extend,
        defaultSettings = {cache: false, url: '/'};

        //Merge default setting with user's settings.
        function mergeSettings(settings){
            return extend({}, defaultSettings, settings);
        }

    //A simple promise-based wrapper around jQuery Ajax. All methods return a Promise.
    v.ajax = {
        //http "GET"
        ajaxGet: function ajaxGet(settings){
            settings.type = 'GET';
            return v.$.ajax(mergeSettings(settings));
        },
        //http "POST"
        ajaxPost: function ajaxPost(settings){
            settings.type = 'POST';
            return v.$.ajax(mergeSettings(settings));
        },
        //http "PUT"
        ajaxPut: function ajaxPut(settings){
            settings.type = 'PUT';
            return v.$.ajax(mergeSettings(settings));
        },
        //http "DELETE"
        ajaxDelete: function ajaxDelete(settings){
            settings.type = 'DELETE';
            return v.$.ajax(mergeSettings(settings));
        }
    };

});
