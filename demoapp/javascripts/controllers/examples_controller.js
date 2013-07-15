define(["coccyx", "messagesRegistry"], function(Coccyx, messagesRegistry) {
    "use strict";

    // Private message, only used internally in this module so it isn't defined in the messages dictionary.
    var MSG_INVALID_CREDENTIALS = "MSG_INVALID_CREDENTIALS ";

    Coccyx.pubsub.subscribe(MSG_INVALID_CREDENTIALS, function(){
        alert("Please enter a valid email address and password.");
    });

    var showExamplesPage = function(){
        Coccyx.views.render("examples");
    };

    var postFormExample = function(formValuesHash){
        var model = Coccyx.models.getModel("user");
        console.log("examples controller::postForExample method called with formValuesHash " + JSON.stringify(formValuesHash));
        console.log("model = " + JSON.stringify(model));
        if(validateUser(formValuesHash)){
            formValuesHash.rememberme = formValuesHash.rememberme ? true : false;
            formValuesHash.pardonmyappearance = formValuesHash.pardonmyappearance ? true : false;
            model.setData(formValuesHash, {empty:true, readOnly:true});
            Coccyx.pubsub.publish(messagesRegistry.MSG_LOGGED_IN, model.getProperty("email"));
            Coccyx.router.navigate({url:"/", trigger:true});
        }else{
            Coccyx.pubsub.publish(MSG_INVALID_CREDENTIALS);
        }
    };

    function validateUser(formValuesHash){
        if(formValuesHash.email && formValuesHash.password){
            return true;
        }
        return false;
    }

    return {
        name: "examples",
        routes: {
            "get /": showExamplesPage,
            "post form": postFormExample
        }
    };

});
