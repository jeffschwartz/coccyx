



define(["coccyx"], function(cx) {
    "use strict";

    cx.controllers.registerController({
        doSomethingWithId: function(id){
            alert("invoices/id called. id = " + id);
        },
        doSomethingWithPath: function(path){
            alert("invoices/total called with path = " + path);
        },
        name: "invoices",
        routes: {
            "/": function(){
                alert("invoices called");
            },
            "/:id": function(id){
                this.doSomethingWithId(id);
            },
            "/total/*": function(path){
                this.doSomethingWithPath(path);
            }
        }
    });

});
