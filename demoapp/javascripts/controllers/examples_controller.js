define(["coccyx"], function(Coccyx) {
    "use strict";

    var showExamplesPage = function(){
        Coccyx.views.render("examples");
    };

    var postFormExample = function(formValuesHash){
        var model = Coccyx.models.getModel("user"),
            hash = {};
        console.log("examples controller::postForExample method called with formValuesHash " + JSON.stringify(formValuesHash));
        console.log("model = " + JSON.stringify(model));
        if(validateUser(formValuesHash)){
            hash.email = formValuesHash.email;
            hash.pardonmyappearance = formValuesHash.pardonmyappearance.length ? true : false;
            hash.password = formValuesHash.password;
            hash.rememberme = formValuesHash.rememberme.length ? true : false;
            model.setData(hash);
            model.setProperty("email", "js@wtf.com");
            model.setData(hash, {empty:true, readOnly:true});
            model.setProperty("email", "js@wtf.com");
        }
    };

    function validateUser(formValuesHash){
        return true;
    }

    return {
        name: "examples",
        routes: {
            "get /": showExamplesPage,
            "post form": postFormExample
        }
    };

});
