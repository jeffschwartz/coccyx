(function(cx){
    "use strict";

    /**
     * Coccyx Controllers
     * ------------------
     * Coccyx Controllers are super easy to use. They encapsulate pushstate,
     * history and routing logic so you don't have to deal with them.
     *
     * Multiple Controllers
     * --------------------
     * Coccyx allows you to have multiple controllers, permitting better
     * separation of concerns via granulation. In addition, because
     * you can have multiple controllers, multiple developers can
     * work on them without stepping all over each other's code. If
     * you are using Git or someo other code repository then this
     * should result in less conflicts when developers commit their
     * change back to the repo.
     *
     * Of course, if you want to use only a single controller you can and
     * actually is the preferred method when starting up your project. As
     * your code-base matures, you will find opportunities to modularize
     * and having multiple controllers will help you do that.
     *
     * A few required params
     * ---------------------
     * Coccyx controllers have a few required properties:
     *
     * name - Every controller has to have a name property with a unique value.
     * The controllers name forms the root or all routes. For index page
     * routes, such as "/", just use a name of "", and define a "/" route.
     *
     * routes - You define your routes using a hash, named "routes", whose
     * property names and values define your routes.
     *
     * Property names defines your route's urls.
     *
     * Property values define a function to be called for that url.
     * The router calls these functions with a context of "this" equal to the
     * controller, so you can use controllers objects just like any other
     * JavaScript object.
     *
     * For example, you can declare function expressions in your controller
     * and within router callback functions you can reference them using the
     * "this" keyword.
     */

    function showIndexPage(){
        alert("show index page called");
    }

    cx.controllers.registerController({
        name: "",
        routes: {
            "/": showIndexPage
        }
    });
}(window.Coccyx));