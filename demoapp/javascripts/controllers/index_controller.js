define(["coccyx", "messagesRegistry", "handlebars"], function(Coccyx, messagesRegistry, Handlebars) {
    "use strict";

    // A pubsub message handler that uses a message identifier
    // stored in the message registry that unsubscribes itself.
    Coccyx.pubsub.subscribe(messagesRegistry.MSG_LOGGED_IN, function(email){
        setTimeout(function(){
            var template = Handlebars.templates["loggedin_modal.tmpl"];
            var html = template({email: email});
            this.$("#modal").html(html);
            this.$("#loggedinModal").modal({backdrop: true, keyboard: true, show: true});
        }, 0);
    });

    var showIndexPage = function(){
        Coccyx.views.render("index");
    };

    return {
        name: "",
        routes: {
            "get /": showIndexPage
        }
    };

});
