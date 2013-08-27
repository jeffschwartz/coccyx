define('ajax', ['jquery'], function($){
    'use strict';

    var Coccyx = window.Coccyx = window.Coccyx || {};

    //A promise-based wrapper around jQuery Ajax.
    //All methods return a Promise.
    Coccyx.ajax = {
        //http GET
        ajaxGet: function(url, data){
            return $.ajax({type: 'GET', url: url, data: data});
        },
        //http POST
        ajaxPost: function(url, data){
            return $.ajax({type: 'POST', url: url, data: data});
        },
        //http PUT
        ajaxPut: function(url, data){
            return $.ajax({type: 'PUT', url: url, data: data});
        },
        //http DELETE
        ajaxDelete: function(url, data){
            return $.ajax({type: 'DELETE', url: url, data: data});
        }
    };

});
