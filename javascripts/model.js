define('models', [], function(){
    'use strict';

    //TODO: rename set and get Property to something else!

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
        deepCopy = Coccyx.helpers.deepCopy,
        proto;

    //0.6.0
    //Publish event
    function publishPropertyChangeEvent(model, propertyPath, value){
        Coccyx.pubsub.publish(model.getModelName() + '_MODEL_EVENT', {eventSubType: 'MODEL_PROPERTY_CHANGED', propertyPath: propertyPath, value: value, model: model});
    }

    //0.6.0
    //Return the property reachable through the property path or undefined.
    function findProperty(obj, propertyPath){
        if(!obj){
            return;
        }
        var a = propertyPath.split('.');
        if(a.length === 1){
            return obj[propertyPath];
        }
        //Try the next one in the chain.
        return findProperty(obj[a[0]], a.slice(1).join('.'));
    }

    //0.6.0
    //Sets the property reachable through the property path, creating it first if necessary, with a deep copy of val.
    function findAndSetProperty(obj, propertyPath, val){
        var a = propertyPath.split('.');
        if(a.length === 1){
            obj[propertyPath] = typeof val === 'object' ? deepCopy(val) : val;
        }else{
            if(!obj.hasOwnProperty(a[0])){
                obj[a[0]] = {};
            }
            findAndSetProperty(obj[a[0]], a.slice(1).join('.'), val);
        }
    }

    //0.5.0
    function extend(modelObject){
        // Create a new object using proto as its prototype and
        // extend that object with modelObject if it was supplied.
        var obj1 =  modelObject ? Coccyx.helpers.extend(Object.create(proto), modelObject) : proto;
        var obj2 = Object.create(obj1);
        // Decorate the new object with additional properties.
        obj2.isSet = false;
        obj2.isReadOnly = false;
        obj2.isDirty = false;
        obj2.originalData = {};
        obj2.changedData = {};
        obj2.data = {};
        return obj2;
    }

    // model prototype properties...
    proto = {
        setData: function setData (dataHash, options) {
            var o = {empty:false, readOnly:false, dirty:false, validate: false};
                // ,prop;
            // Merge default options with passed in options.
            if(options){
                Coccyx.helpers.replace(o, options);
            }
            // If options validate is true and there is a validate method and
            // it returns false, sets valid to false and returns false.
            // If options validate is true and there is a validate method and
            // it returns true, sets valid to true and proceeds with setting data.
            // If options validate is false or there isn't a validate method
            // set valid to true.
            this.isValid = o.validate && this.validate ? this.validate(dataHash) : true;
            if(!this.isValid){
                return false;
            }
            // Deep copy.
            this.originalData = o.empty ? {} : deepCopy(dataHash);
            this.isReadOnly = o.readOnly;
            this.isDirty = o.dirty;
            // Deep copy.
            this.data = deepCopy(dataHash);
            this.changedData = {};
            this.isSet = true;
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
        // Returns the property reachable through property path. If
        // there is no property reachable through property path
        // return undefined.
        getProperty: function getProperty(propertyPath){
            var v = findProperty(this.data, propertyPath);
            return typeof v === 'object' ? deepCopy(v) : v;
        },
        //Sets a property on an object reachable through the property path.
        //If the property doesn't exits, it will be created and then assigned
        //its value (using a deep copy if typeof data === 'object'). Calling
        //set with a nested object or property is therefore supported. For
        //example, if the property path is address.street and the model's data
        // hash is {name: 'some name'}, the result will be
        //{name: 'some name', address: {street: 'some street'}}; and the changed
        //data hash will be {'address.street': some.street'}.
        setProperty: function setProperty(propertyPath, val){
            // A model's data properties cannot be written to if the model
            // hasn't been set yet or if the model is read only.
            if(this.isSet){
                if(!this.isReadOnly){
                    findAndSetProperty(this.data, propertyPath, val);
                    this.changedData[propertyPath] = deepCopy(val);
                    this.isDirty = true;
                    //0.6.0
                    //Named models publish change events.
                    if(this.modelName){
                        publishPropertyChangeEvent(this, propertyPath, val);
                    }
                }else{
                    console.log('Warning! Coccyx.model::setProperty called on read only model.');
                }
            }else{
                console.log('Warning! Coccyx.model::setProperty called on model before model::set was called.');
            }
            // For chaining.
            return this;
       },
       //0.6.0
       toJSON: function(){
            return JSON.stringify(this.data);
       },
       //0.6.0
       getModelName: function(){
            return this.modelName;
       }
    };

    Coccyx.models = {
        extend: extend,
        //0.6.0
        findProperty: findProperty
    };

});
