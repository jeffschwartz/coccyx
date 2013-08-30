define('ajax', ['jquery'], function($){
    'use strict';

    var Coccyx = window.Coccyx = window.Coccyx || {};

    //A promise-based wrapper around jQuery Ajax.
    //All methods return a Promise.
    Coccyx.ajax = {
        //http GET
        ajaxGet: function(settings){
            settings.type = 'GET';
            return $.ajax(settings);
        },
        //http POST
        ajaxPost: function(settings){
            settings.type = 'POST';
            return $.ajax(settings);
        },
        //http PUT
        ajaxPut: function(settings){
            settings.type = 'PUT';
            return $.ajax(settings);
        },
        //http DELETE
        ajaxDelete: function(settings){
            settings.type = 'DELETE';
            return $.ajax(settings);
        }
    };

});
