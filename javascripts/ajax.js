define('ajax', ['jquery'], function($){
    'use strict';

    var Coccyx = window.Coccyx = window.Coccyx || {},
        helpers = Coccyx.helpers,
        defaultSettings = {cache: false, url: '/'};

        //Mege default setting with user's settings.
        function mergeSettings(settings){
            return helpers.extend({}, defaultSettings, settings);
        }

    //A simple promise-based wrapper around jQuery Ajax. All methods return a Promise.
    Coccyx.ajax = {
        //http "GET"
        ajaxGet: function(settings){
            settings.type = 'GET';
            return $.ajax(mergeSettings(settings));
        },
        //http "POST"
        ajaxPost: function(settings){
            settings.type = 'POST';
            return $.ajax(mergeSettings(settings));
        },
        //http "PUT"
        ajaxPut: function(settings){
            settings.type = 'PUT';
            return $.ajax(mergeSettings(settings));
        },
        //http "DELETE"
        ajaxDelete: function(settings){
            settings.type = 'DELETE';
            return $.ajax(mergeSettings(settings));
        }
    };

});
