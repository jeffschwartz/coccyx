define('models', ['helpers', 'ajax', 'application', 'eventer'], function(){
    'use strict';

    /**
     * Warning!!!! Don't use primitive object wrappers, Date objects or functions as data property values.
     * This is because model uses JSON.parse(JSON.stringify(data)) to perform a deep copy of your model
     * data and JSON doesn't support primitive object wrappers, Date objects or functions.
     * (see https://developer.mozilla.org/en-US/docs/JSON for details)
     * Deep copying is necessary to isolate the originalValues and changedValues from
     * changes made in data. If you don't heed this warning bad things _will_ happen!!!
     */

    var v = window.Coccyx = window.Coccyx || {}, ajax = v.ajax, deepCopy = v.helpers.deepCopy, ext = v.helpers.extend, replace = v.helpers.replace, proto, propertyChangedEvent = 'MODEL_PROPERTY_CHANGED_EVENT', syntheticId = -1, isSilent = v.helpers.isSilent;

    //0.6.0 Publishes MODEL_PROPERTY_CHAGED_EVENT event via Coccyx.eventer.
    function publishPropertyChangeEvent(model, propertyPath, value){model.trigger(propertyChangedEvent, {propertyPath: propertyPath, value: value, model: model});}

    //0.6.0 Return the property reachable through the property path or undefined.
    function findProperty(obj, propertyPath){
        //0.6.0 Return false if obj is an array or not an object.
        if(Array.isArray(obj) || typeof obj !== 'object'){return;}
        var a = propertyPath.split('.');
        if(a.length === 1){return obj[propertyPath];}
        //Try the next one in the chain.
        return findProperty(obj[a[0]], a.slice(1).join('.'));
    }

    //0.6.0 Sets the property reachable through the property path, creating it first if necessary, with a deep copy of val.
    function findAndSetProperty(obj, propertyPath, val){
        var a = propertyPath.split('.');
        if(a.length === 1){obj[propertyPath] = typeof val === 'object' ? deepCopy(val) : val;}
        else{
            if(!obj.hasOwnProperty(a[0])){obj[a[0]] = {};}
            findAndSetProperty(obj[a[0]], a.slice(1).join('.'), val);
        }
    }

    //0.6.0 Deletes the property reachable through the property path.
    function findAndDeleteProperty(obj, propertyPath){
        var a = propertyPath.split('.');
        if(a.length === 1){delete obj[propertyPath];}
        else{
            if(!obj.hasOwnProperty(a[0])){obj[a[0]] = {};}
            findAndDeleteProperty(obj[a[0]], a.slice(1).join('.'));
        }
    }

    //0.5.0
    //0.6.0 Added support for Coccyx.eventer.
    function extend(modelObject){
        var obj0 = Object.create(proto), obj1 = modelObject ? ext(obj0, modelObject) : obj0, obj2 = modelObject ? Object.create(obj1) : obj1;
        //Decorate the new object with additional properties.
        obj2.isSet = false;
        obj2.isReadOnly = false;
        obj2.isDirty = false;
        obj2.originalData = {};
        obj2.changedData = {};
        obj2.data = {};
        //0.6.3 Eventer no longer placed on prototype as in prior versions. Its methods are now mixed in with the final object.
        return v.eventer.extend(obj2);
    }

    //0.6.0.
    function setAjaxSettings(settings, verb){
        /*jshint validthis:true*/
        settings = settings ? settings : {}; //0.6.4.
        settings.url = this.endPoint;
        if(verb !== 'post'){settings.url += ('/' + this.data[this.idPropertyName]);}
        if(verb !== 'get'){settings.data = this.getData();}
        return settings;
    }

    //0.6.0 Returns a promise. 0.6.4 Renamed to doAjax, added settings argument, removed rawJson option & added call to model.parse().
    function doAjax(verb, settings, fn){
        /*jshint validthis:true*/
        var deferred = v.$.Deferred(), self = this, promise;
        promise = fn(setAjaxSettings.call(this, settings, verb));
        promise.done(function(data){
            //0.6.4. If 'get' and data was returned call parse.
            data = verb === 'get' && data ? self.parse(data) : data;
            //If data was returned set this model's data.
            if(data){self.setData(ext(self.getData(),data));}
            //Calls promise.done passing this model.
            deferred.resolve(self);
        });
        //Calls promise.fail. 0.6.4 now returns this model as 1st argument.
        promise.fail(function(jqXHR, textStatus, errorThrown){deferred.reject(self, jqXHR, textStatus, errorThrown);});
        return deferred.promise();
    }

    //model prototype properties...
    proto = {
        setData: function setData (dataHash, options) {
            var o = {empty:false, readOnly:false, dirty:false, validate: false};
            //Merge default options with passed in options.
            if(options){replace(o, options);}
            //If options validate is true and there is a validate method and it returns false, sets valid to false and returns false.
            //If options validate is true and there is a validate method and it returns true, sets valid to true and proceeds with setting data.
            //If options validate is false or there isn't a validate method set valid to true.
            this.isValid = o.validate && this.validate ? this.validate(dataHash) : true;
            if(!this.isValid){return false;}
            //Deep copy.
            this.originalData = o.empty ? {} : deepCopy(dataHash);
            this.isReadOnly = o.readOnly;
            this.isDirty = o.dirty;
            //Deep copy.
            this.data = deepCopy(dataHash);
            //0.6.0 Every model has an idPropetyName whose value is the name of the model's data id property.
            if(typeof this.idPropertyName === 'undefined') {this.idPropertyName = 'id';}
            //0.6.0 Every model has a modelId property, either a synthetic one (see syntheticId, above)
            //or one provided by the model's data and whose property name is this.idPropertyName.
            this.modelId = this.data.hasOwnProperty(this.idPropertyName) ? this.data[this.idPropertyName] : syntheticId--;
            this.changedData = {};
            this.isSet = true;
            return true;
        },
        getData: function getData(){return deepCopy(this.data);},
        //Returns deep copy of originalData
        getOriginalData: function getOriginalData(){return deepCopy(this.originalData);},
        //Returns deep copy of changedData
        getChangedData: function getChangedData(){return deepCopy(this.changedData);},
        //Returns the data property reachable through property path. If there is no property reachable through property path
        //return undefined.
        getProperty: function getProperty(propertyPath){var p = findProperty(this.data, propertyPath); return typeof p === 'object' ? deepCopy(p) : p;},
        //Returns the originalData property reachable through property path. If there is no property reachable through property path
        //return undefined.
        getOriginalDataProperty: function getOriginalDataProperty(propertyPath){var p = findProperty(this.originalData, propertyPath); return typeof p === 'object' ? deepCopy(p) : p;},
        //Returns the changedData property reachable through property path. If there is no property reachable through property path
        //return undefined.
        getChangedDataProperty: function getChangedDataProperty(propertyPath){var p = findProperty(this.changedData, propertyPath); return typeof p === 'object' ? deepCopy(p) : p;},
        //Sets a property on an object reachable through the property path and fires publishPropertyChangeEvent if options.silent isn't
        //passed or is false. Maintains deletedColl. If the property doesn't exits, it will be created and then assigned its value
        //(using a deep copy if typeof data === 'object'). Calling set with a nested object or property is therefore supported. For
        //example, if the property path is address.street and the model's data hash is {name: 'some name'}, the result will be
        //{name: 'some name', address: {street: 'some street'}}; and the changed data hash will be {'address.street': some.street'}.
        setProperty: function setProperty(propertyPath, val){
            //A model's data properties cannot be written to if the model hasn't been set yet or if the model is read only.
            if(this.isSet && !this.isReadOnly){
                findAndSetProperty(this.data, propertyPath, val);
                this.changedData[propertyPath] = deepCopy(val);
                this.isDirty = true;
                //0.6.0 Maintain id's state when setting properties on data.
                if(this.data.hasOwnProperty(this.idPropertyName)){this.modelId = this.data[this.idPropertyName];}
                //0.6.3 Check for silent.
                if(!isSilent(arguments)){publishPropertyChangeEvent(this, propertyPath, val);}
            }
                else{console.log(!this.isSet ? 'Warning! setProperty called on model before set was called.' : 'Warning! setProperty called on read only model.');}
            //For chaining.
            return this;
        },
        //0.6.0 Delete a property from this.data via property path and fires publishPropertyChangeEvent
        //if options.silent isn't passed or is false. Maintains deletedColl
        deleteProperty: function deleteProperty(propertyPath){
            //A model's data properties cannot be deleted if the model hasn't been set yet or if the model is read only.
            if(this.isSet && !this.isReadOnly){
                findAndDeleteProperty(this.data, propertyPath);
                this.changedData[propertyPath] = undefined;
                this.isDirty = true;
                if(this.data.hasOwnProperty(this.idPropertyName)){this.modelId = this.data[this.idPropertyName];}
                //0.6.3 Check for silent.
                if(!isSilent(arguments)){publishPropertyChangeEvent(this, propertyPath, undefined);}
            }else{console.log(!this.isSet ? 'Warning! deleteProperty called on model before set was called.' : 'Warning! deleteProperty called on read only model.');}
        },
        //0.6.0 Returns true if model is new, false otherwise.
        isNew: function isNew(){return (typeof this.data[this.idPropertyName] === 'undefined');},
        //0.6.0 Returns stringified model's data hash.
        toJSON: function toJSON(){return JSON.stringify(this.data);},
        //0.6.4 For the 4 following ajax methods, ajaxSettings is a hash which can contain any valid jQuery.ajax setting.
        //0.6.0 Ajax "GET".
        ajaxGet: function ajaxGet(ajaxSettings){return doAjax.call(this, 'get', ajaxSettings, ajax.ajaxGet);},
        //0.6.0 Ajax "POST".
        ajaxPost: function ajaxPost(ajaxSettings){return doAjax.call(this, 'post', ajaxSettings, ajax.ajaxPost);},
        //0.6.0 Ajax "PUT".
        ajaxPut: function ajaxPut(ajaxSettings){return doAjax.call(this, 'put', ajaxSettings, ajax.ajaxPut);},
        //0.6.0 Ajax "DELETE".
        ajaxDelete: function ajaxDelete(ajaxSettings){return doAjax.call(this, 'delete', ajaxSettings, ajax.ajaxDelete);},
        //0.6.4 Override to transform the data returned from Ajax call and return json.
        parse: function parse(data){return data;}
    };

    v.models = {extend: extend, propertyChangedEvent: propertyChangedEvent};
});
