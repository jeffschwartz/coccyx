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
        deepCopy = Coccyx.helpers.deepCopy,
        proto;

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
                //TODO remove these comments after testing Coccyx.helpers.replace.
                // for(prop in o){
                //     if(o.hasOwnProperty(prop) && options.hasOwnProperty(prop)){
                //         o[prop] = options[prop];
                //     }
                // }
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
            this.is;ReadOnly = o.readOnly;
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
            if(this.isSet){
                if(!this.isReadOnly){
                    // Deep copy, maintain the changedValues hash.
                    this.changedData[propertyName] = deepCopy(data);
                    // Deep copy if property is typeof 'object'.
                    this.data[propertyName] = typeof data === 'object' ?
                    deepCopy(data) : data;
                    this.isDirty = true;
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
       }
    };

    Coccyx.models = {
        extend: extend
    };

});
