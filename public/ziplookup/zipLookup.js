/*
 * $.zipLookup v0.1
 *   - by Ari Asulin (ari.asulin at gmail.com)
 *   - jQuery plugin to dynamically fill in City/State Form Fields using an ajax Zipcode lookup
 *   - Apache License, Version 2.0
 *
 */

(function($) {
    $.extend({
        zipLookupSettings: {
            libDirPath: null,                   // The path to this library folder, i.e. 'ziplookup/',
            dbPath: 'db/',                      // Database directory
            country: 'us',                      // Selected Country
            onFound: function () {},            // Callback when zip code is found
            onNotFound: function () {},         // Callback when zip code is not found
            onError: function () {}             // Callback when error occurs
        },

        zipLookup: function( zipVal, s, onNotFound) {
            if(s instanceof Function)           // If a function was passed, add the function to onFound
                s = {onFound : s};
            s = jQuery.extend(true, {}, jQuery.zipLookupSettings, s);
                                                // Extend settings.
            if(onNotFound instanceof Function)  // If a second function was passed, add the function to onNotFound
                s.onNotFound = onNotFound;

            if(s.libDirPath == null)            // If the library path is null, try to determine the library path.
            {
                var libDirPath = $("script[src*='zipLookup.js'],script[src*='zipLookup.min.js']").attr('src');
                if(libDirPath)                  // Look for this script in the header
                    s.libDirPath = libDirPath.replace('zipLookup.js', '').replace('zipLookup.min.js', '');
                else                            // If not found, enter a default value
                    s.libDirPath = 'ziplookup/';
            }

            if(!parseInt(zipVal, 10))                       // If not a valid zip, error
                return s.onNotFound("Invalid zip code: "+ zipVal);
            zipVal = parseInt(zipVal, 10);
            var zipGroup = parseInt(zipVal / 100);      // Determine the zip group
            var zipSet = parseInt(zipVal % 100);        // Determine the zip set

            var path = s.libDirPath + s.dbPath + s.country + "/" + zipGroup + ".js";
                                                        // Figure out the path to the zip group

            $.ajax({
                url: path,
                dataType: 'jsonp',                      // We're using JSONP for cross-site queries
                jsonpCallback: '__zl',                  // This is the JSONP callback
                cache: true,
                success: function (data) {
                    if(data === undefined || data[0] === undefined)         // If no data returned, the file was probably 404
                        return s.onNotFound("Zipcode Not Found in DB");     // Thus, zip is not in the db
                    var cityID = data[0][zipSet];                           // Look for the City ID in the dataset.
                    if(data[1][cityID] === undefined)                       // If no city,
                        return s.onNotFound("Zipcode Not Found in DB");     // the zip is not in the db
                    var cityData = data[1][cityID].split('|');              // Split the city data into name and State ID
                    var cityName = cityData[0];
                    if(!cityData[1]) cityData[1] = 0;                       // If no State ID was added, this means its 0
                    var stateID = cityData[1];                              // Set State ID
                    var stateData = data[2][stateID].split('|');            // Split State name and abbreviation
                    var stateName = stateData[1];                           // State Name
                    var stateShortName = stateData[0];                      // State abbreviation
                    s.onFound(cityName, stateName, stateShortName);         // Execute onFound callback with data
                },
                fail: function (jqXHR, textStatus){
                    s.onError(jqXHR, textStatus);                           // If an error occured, execute onError callback
                    s.onNotFound("Error: " + textStatus);                   // Technically this means zip was NotFound as well.
                }
            });

        }

    });
})(jQuery);
