define("models", [], function(){
    "use strict";

    /**
     * Model
     * Warning!!!! Don't use primitive object wrappers, Date objects or functions as data
     * property values. This is because model uses JSON.parse(JSON.stringify(data)) to
     * perform a deep copy of your model data and JSON doesn't support primitive object
     * wrappers, Date objects or functions.
     * (see https://developer.mozilla.org/en-US/docs/JSON for details)
     * Deep copying is necessary to isolate the originalValues and changedValues from
     * changes made in data. If you don't heed this warning bad things _will_ happen!!!
     */

    var Coccyx = window.Coccyx = window.Coccyx || {},
        models = {},
        deepCopy = Coccyx.helpers.deepCopy;

    function registerModels(){

        if(arguments.length !== 1 && !(arguments[0] instanceof Array) && !(arguments[0] instanceof Object)){
            // TODO Not sure if I should be throwing here. Think about it!!!
            throw new Error("registerModels missing or invalid param. Expected an [] or {}.");
        }
        if(arguments[0] instanceof Array){
            // An array of hashes.
            arguments[0].forEach(function(model){
                loadModel(model);
            });
        }else{
            // A single hash.
            loadModel(arguments[0]);
        }
    }

    function loadModel(model){
        model.set = false;
        model.readOnly = false;
        model.dirty = false;
        model.originalData = {};
        model.changedData = {};
        model.data = {};
        models[model.name] = model;
        model.setData = setData;
        model.getProperty = getProperty;
        model.setProperty = setProperty;
        console.log("Registering model '" + model.name + "'");
    }

    function getModel(name){
        if(models.hasOwnProperty(name)){
            return models[name];
        }
    }

    function setData (dataHash, options) {
        /* jshint validthis:true */

        var o = {empty:false, readOnly:false, dirty:false},
            prop;
        // Merge default options with passed in options.
        if(options){
            for(prop in o){
                if(o.hasOwnProperty(prop) && options.hasOwnProperty(prop)){
                    o[prop] = options[prop];
                }
            }
        }
        // Deep copy.
        this.originalData = o.empty ? {} : deepCopy(dataHash);
        this.readOnly = o.readOnly;
        this.dirty = o.dirty;
        // Deep copy.
        this.data = deepCopy(dataHash);
        this.changedData = {};
        this.set = true;
    }

    // model instance properties...

    function getProperty(propertyName){
        /* jshint validthis:true */

        return this.data[propertyName];
    }

    function setProperty(propertyName, data){
        /* jshint validthis:true */

        // A model's data properties cannot be written to if the model
        // hasn't been set yet or if the model is read only.
        if(this.set && !this.readOnly){
            // Deep copy, maintain the changedValues hash.
            this.changedData[propertyName] = deepCopy(data);
            this.data[propertyName] = data;
            this.dirty = true;
        }else{
            console.log("Warning! Coccyx.model::setProperty called on read only model.");
        }
        // For chaining.
        return this;
    }

    Coccyx.models = {
        registerModels: registerModels,
        getModel: getModel
    };

});
