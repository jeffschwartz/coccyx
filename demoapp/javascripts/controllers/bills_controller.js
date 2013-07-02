(function(cx){
    "use strict";

    cx.controllers.registerController({
        doSomethingWithId: function(id){
            alert("bills/id called. id = " + id);
        },
        doSomethingWithPath: function(path){
            alert("bills/total called with path = " + path);
        },
        name: "bills",
        routes: {
            "/": function(){
                alert("bills called");
            },
            "/:id": function(id){
                this.doSomethingWithId(id);
            },
            "/total/*": function(path){
                this.doSomethingWithPath(path);
            }
        }
    });
}(window.Coccyx));
