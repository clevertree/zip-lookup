/*
 * jQuery.zipLookup v0.2
 *   - by Ari Asulin (ari.asulin at gmail.com)
 *   - New permanent url for zero-installation users: http://clevertree.github.io/zip-lookup/zip-lookup.js
 *   - New Demo page: http://clevertree.github.io/zip-lookup/
 *   - Re-wrote db gen script in node.js. Fixed 0XXXX bug. Fixed default city bug.
 *   - Removed jQuery dependency
 *   - Code/DB cleanup
 *   - Event driven js
 *   - jQuery plugin to dynamically fill in City/State Form Fields using an ajax Zipcode lookup
 *   - Apache License, Version 2.0
 */

(function() {
    var DEBUG = false;
    var GROUP_LENGTH = 2;

    var CLASS_ZIPCODE = 'zip-lookup-field-zipcode';
    var CLASS_CITY = 'zip-lookup-field-city';
    var CLASS_CITY_TITLE_CASE = 'zip-lookup-field-city-title-case';
    var CLASS_STATE = 'zip-lookup-field-state';
    var CLASS_STATE_SHORT = 'zip-lookup-field-state-short';
    var CLASS_MESSAGE = 'zip-lookup-message';

    var setValue = function(element, value) {
        if(element.nodeName.toLowerCase() === 'select') {
            var options = element.getElementsByTagName('option');
            for (var i = 0; i < options.length; i++) {
                if (options[i].value === value || options[i].innerHTML === value) {
                    element.selectedIndex = i;
                    return;
                }
            }
        }

        if(element.nodeName.toLowerCase() === 'input') {
            element.setAttribute('value', value);

        } else {
            element.setAttribute('data-value', value);
        }
    };

    var hasClass = function(element, className) {
        return new RegExp("(^|\\s)" + className + "(\\s|$)", 'i').test(element.className);
    };
    var addClass = function(element, className) {
        if(!hasClass(element, className))
            element.className += (element.className ? " " : "" ) + className;
    };
    var removeClass = function(element, className) {
        if(hasClass(element, className))
            element.className = element.className.replace(new RegExp("(^|\\s)" + className + "(\\s|$)", 'i'), '');
    };

    var fireEvent = function(element, eventName) {
        var event; // The custom event that will be created

        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent(eventName, true, true);
        } else {
            event = document.createEventObject();
        }
        event.eventName = eventName;
        //event.target = element;

        if (document.createEvent) {
            element.dispatchEvent(event);
        } else {
            element.fireEvent("on" + eventName, event);
        }

        return event;
    };

    var traverseDOM = function (elm, callback) {
        if(elm === document)
            elm = document.body;

        for(var i=0; i<elm.children.length; i++) {
            var child = elm.children[i];
            if(callback)
                if(callback(child) === true)
                    return false;

            if(traverseDOM(child, callback) === false)
                return false;
        }
        return true;
    };

    var ascendDOM = function (elm, callback) {
        if(elm === document.body || elm === document)
            return false;
        var parent = elm.parentNode;
        if(callback)
            if(callback(parent) === true)
                return false;

        return ascendDOM(parent, callback);
    };

    var lookup = function(zipVal, country) {
        var THIS = this;
        this.country = country || 'us';

        var head = document.getElementsByTagName('head')[0];
        var libDirPath = 'zip-lookup/db';
        traverseDOM(head, function(elm) {
            if(elm.nodeName.toUpperCase() === 'SCRIPT') {
                if(elm.getAttribute('src') && elm.getAttribute('src').match(/zip-lookup(?:\.min)?\.js$/i)) {
                    libDirPath = elm.getAttribute('src').replace(/zip-lookup(?:\.min)?\.js$/i, 'db');
                    if(DEBUG)
                        console.log("Library path set: " + libDirPath);
                    head = elm.parentNode;
                    return true;
                }
            }
        });


        var onSuccess = function(cityName, stateName, stateShortName) {};
        this.onSuccess = function(callback) { onSuccess = callback; return THIS; };

        var onError = function(throwError) {};
        this.onError = function(callback) { onError = callback; return THIS; };

        //if(!(zipVal = parseInt(zipVal, 10)))                  // If not a valid zip, error
        //    throw new Error("Invalid zip code: "+ zipVal);

        if (country == "uk") {
            var groupLength = zipVal.search(/\d/);
            var zipGroup = zipVal.substr(0, groupLength);                               // Determine the zip group
            var zipSet = zipVal.substr(groupLength, zipVal.search(" ") - groupLength);  // Determine the zip set
        } else {
            var zipGroup = zipVal.substring(0, GROUP_LENGTH);       // Determine the zip group
            var zipSet = zipVal.substring(GROUP_LENGTH);            // Determine the zip set
        }

        var path = libDirPath + '/' + this.country + '/' + zipGroup + ".js";
        // Figure out the path to the zip group


        var script = document.createElement('script');
        script.src = path;
        script.type = 'text/javascript';
        script.async = true;
        head.appendChild(script);

        var errorTimeout = setTimeout(function() {
            onError("Search Timed out");
        }, 3000);

        window['__zl'] = function(data) {
            clearTimeout(errorTimeout);
            if(data === undefined || data[0] === undefined)         // If no data returned, the file was probably 404
                return onError("Zipcode Not Found in DB");          // Thus, zip is not in the db
            var cityID = data[0][zipSet];                           // Look for the City ID in the dataset.
            if(data[1][cityID] === undefined)                       // If no city,
                return onError("Zipcode City Not Found in DB");     // the zip is not in the db
            var cityData = data[1][cityID].split('|');              // Split the city data into name and State ID
            var cityName = cityData[0];
            if(!cityData[1]) cityData[1] = 0;                       // If no State ID was added, this means its 0
            var stateID = cityData[1];                              // Set State ID
            var stateData = data[2][stateID].split('|');            // Split State name and abbreviation
            var stateName = stateData[1];                           // State Name
            var stateShortName = stateData[0];                      // State abbreviation
            onSuccess(cityName, stateName, stateShortName);  // Execute onFound callback with data
        };

        return this;

    };

    var messageElements = document.getElementsByClassName(CLASS_MESSAGE);

    var eventHandler = function(e) {
        switch(e.type) {
            case 'blur':
            case 'change':
                if(hasClass(e.target, CLASS_ZIPCODE)) {
                    var val = e.target.value;
                    var lastVal = typeof e.target.lastVal === 'undefined' ? null : e.target.lastVal;
                    if(val && val !== lastVal) {
                        e.target.lastVal = val;
                        fireEvent(e.target, 'zip-lookup');
                    }
                }

                break;
            case 'zip-lookup':
                var zip = e.target ? e.target.value.trim() : null;

                var container = e.target.form || document;
                ascendDOM(e.target, function(elm) {
                    if(elm.nodeName.toLowerCase() === 'fieldset'
                        || elm === container) {
                        container = elm;
                        return true;
                    }
                });
                for(var i=0; i<messageElements.length; i++) (function(elm) {
                    elm.innerHTML = "Searching...";
                    removeClass(elm, 'error');
                })(messageElements[i]);


                lookup(zip)
                    .onError(function(error) {
                        e.target.setAttribute('zip-lookup-error-message', error);
                        fireEvent(e.target, 'zip-lookup-error');

                        for(var i=0; i<messageElements.length; i++) (function(elm) {
                            elm.innerHTML = error;
                            addClass(elm, 'error');
                        })(messageElements[i]);

                    }).onSuccess(function (cityName, stateName, stateShortName) {
                        console.info("Location Chosen: ", zip, cityName, stateName, stateShortName);
                        traverseDOM(container, function(elm) {
                            if(hasClass(elm,  CLASS_CITY))
                                setValue(elm, cityName);
                            if(hasClass(elm,  CLASS_CITY_TITLE_CASE))
                                setValue(elm, titleCase(cityName));

                            if(hasClass(elm,  CLASS_STATE)){
                                setValue(elm, stateName);}
                            if(hasClass(elm,  CLASS_STATE_SHORT))
                                setValue(elm, stateShortName);

                            if(hasClass(elm,  CLASS_MESSAGE)){
                                elm.innerHTML = "Result found - " + cityName + ', ' + stateShortName;
                                removeClass(elm, 'error');
                            }
                        });

                        e.target.setAttribute('data-city-name', cityName);
                        e.target.setAttribute('data-state-name', stateName);
                        e.target.setAttribute('data-state-short-name', stateShortName);
                        fireEvent(e.target, 'zip-lookup-found');

                        for(var i=0; i<messageElements.length; i++) (function(elm) {
                            elm.innerHTML = "Found " + titleCase(cityName) + ", " + stateName;
                            removeClass(elm, 'error');
                        })(messageElements[i]);

                    });
                break;
            default:
                break;
        }
    };
    document.addEventListener('blur', eventHandler);
    document.addEventListener('change', eventHandler);
    document.addEventListener('zip-lookup', eventHandler);


    function titleCase(str) {
        return str.toLowerCase()
            .replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
                return $1.toUpperCase();
            });
    }
})();
