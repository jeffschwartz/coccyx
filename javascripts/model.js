define('models', [], function(){
    'use strict';

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
        deepCopy = Coccyx.helpers.deepCopy,
        proto;

    function registerModels(){

        if(arguments.length !== 1 && !(arguments[0] instanceof Array) && !(arguments[0] instanceof Object)){
            // TODO Not sure if I should be throwing here. Think about it!!!
            throw new Error('registerModels missing or invalid param. Expected an [] or {}.');
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
        // Create a new object based on proto and extend
        // that with the model and save it in the hash.
        var obj =  Coccyx.helpers.extend(Object.create(proto), model);
        models[model.name] = obj;
        console.log('Registering model \'' + model.name + '\'');
    }

    function getModel(name){
        var obj;
        if(models.hasOwnProperty(name)){
            // Create a new object using the model as the prototype.
            obj = Object.create(models[name]);
            // Decorate the new object with its own properties.
            obj.set = false;
            obj.readOnly = false;
            obj.dirty = false;
            obj.originalData = {};
            obj.changedData = {};
            obj.data = {};
            return obj;
        }
    }

    // model prototype properties...
    proto = {
        setData: function setData (dataHash, options) {
            var o = {empty:false, readOnly:false, dirty:false, validate: false},
                prop;
            // Merge default options with passed in options.
            if(options){
                for(prop in o){
                    if(o.hasOwnProperty(prop) && options.hasOwnProperty(prop)){
                        o[prop] = options[prop];
                    }
                }
            }
            // If options validate is true and there is a validate method and
            // it returns false, sets valid to false and returns false.
            // If options validate is true and there is a validate method and
            // it returns true, sets valid to true and proceeds with setting data.
            // If options validate is false or there isn't a validate method
            // set valid to true.
            this.valid = o.validate && this.validate ? this.validate(dataHash) : true;
            if(!this.valid){
                return false;
            }
            // Deep copy.
            this.originalData = o.empty ? {} : deepCopy(dataHash);
            this.readOnly = o.readOnly;
            this.dirty = o.dirty;
            // Deep copy.
            this.data = deepCopy(dataHash);
            this.changedData = {};
            this.set = true;
            return true;
        },
        getData: function getData(){
            return deepCopy(this.data);
        },
        // Returns deep copy of originalData
        getOriginalData: function getOriginalData(){
            return deepCopy(this.originalData);
        },
        // Returns deep copy of changedData
        getChangedData: function getChangedData(){
            return deepCopy(this.changedData);
        },
        // Returns data[propertyName] or null.
        getProperty: function getProperty(propertyName){
            if (this.data.hasOwnProperty(propertyName)) {
                // Deep copy if property is typeof 'object'.
                return typeof this.data[propertyName] === 'object' ?
                deepCopy(this.data[propertyName]) : this.data[propertyName];
            }
        },
        // Sets the data[propertyName]'s value.
        setProperty: function setProperty(propertyName, data){
            // A model's data properties cannot be written to if the model
            // hasn't been set yet or if the model is read only.
            if(this.set){
                if(!this.readOnly){
                    // Deep copy, maintain the changedValues hash.
                    this.changedData[propertyName] = deepCopy(data);
                    // Deep copy if property is typeof 'object'.
                    this.data[propertyName] = typeof data === 'object' ?
                    deepCopy(data) : data;
                    this.dirty = true;
                }else{
                    console.log('Warning! Coccyx.model::setProperty called on read only model.');
                }
            }else{
                console.log('Warning! Coccyx.model::setProperty called on model before model::set was called.');
            }
            // For chaining.
            return this;
       }
    };

    Coccyx.models = {
        registerModels: registerModels,
        getModel: getModel
    };

});
