# zip-lookup

zip-lookup is a lightweight JSON based (no database) look-up script that uses a pre-configured list of json files to perform a zip-code look-up on (nearly) all available zip-codes. Simply add this library anywhere you have an address form in your websites and make your client's lives a little easier!

*Test it out here*:
----------
http://clevertree.github.io/zip-lookup/index.html


No installation required
----------

*To use it on your form*, simply include 

`<script src="http://clevertree.github.io/zip-lookup/zip-lookup.min.js" type="text/javascript" ></script>`

in your html header.

The script will listen for changes to any form field with the class 

`class='zip-lookup-field-zipcode'`

and will attempt to look up the zipcode on change. 
The script will then update nearby fields with the following classes: 

`class='zip-lookup-field-city' => gets updated with city name`

`class='zip-lookup-field-state' => gets updated with state full name`

`class='zip-lookup-field-state-short' => gets updated with state short name`


*It's that easy*! When the zip-code is found, the city, state and state abbreviation will be updated. 

Example: Simple Form
----------

```
<!DOCTYPE html>

<html lang="en">
    <head>
        <title>Test zipLookup</title>
        <meta http-equiv="content-type" content="text/html; charset=iso-8859-1" />
        <script src="http://clevertree.github.io/zip-lookup/zip-lookup.js" type="text/javascript"></script>
    </head>
    <body>
        <form>
            <legend>Test zip-lookup</legend>
            <div>Enter ZipCode:</div>
            <input type='text' name='zipcode' class='zip-lookup-field-zipcode' />
            <div>Enter City:</div>
            <input type='text' name='city' class='zip-lookup-field-city' />
            <div>Enter State:</div>
            <input type='text' name='state' class='zip-lookup-field-state' />
            <input type='text' name='state-short' class='zip-lookup-field-state-short' />
            <div class="zip-lookup-message info">Status</div>
        </form>
    </body>
</html>
```


Example: 2 Sets of Fields
----------

```
<!DOCTYPE html>

<html lang="en">
    <head>
        <title>Test zipLookup</title>
        <meta http-equiv="content-type" content="text/html; charset=iso-8859-1" />
        <script src="http://clevertree.github.io/zip-lookup/zip-lookup.js" type="text/javascript"></script>
    </head>
    <body>
        <form>
            <div class="zip-lookup-message info">Status</div>
            <fieldset>
                <legend>1st set of fields</legend>
                <div>Enter ZipCode:</div>
                <input type='text' name='zipcode' class='zip-lookup-field-zipcode' />
                <div>Enter City:</div>
                <input type='text' name='city' class='zip-lookup-field-city' />
                <div>Enter State:</div>
                <input type='text' name='state' class='zip-lookup-field-state' />
                <input type='text' name='state-short' class='zip-lookup-field-state-short' />
            </fieldset>
            <fieldset>
                <legend>2nd set of fields</legend>
                <div>Enter ZipCode #2:</div>
                <input type='text' name='zipcode2' class='zip-lookup-field-zipcode' />
                <div>Enter City #2:</div>
                <input type='text' name='city2' class='zip-lookup-field-city' />
                <div>Enter State #2:</div>
                <input type='text' name='state2' class='zip-lookup-field-state' />
                <input type='text' name='state2-short' class='zip-lookup-field-state-short' />
            </fieldset>
        </form>
    </body>
</html>
```


Updates
----------

 * New permanent url for zero-installation users: http://clevertree.github.io/zip-lookup/zip-lookup.js
 * New Demo page: http://clevertree.github.io/zip-lookup/
 * Re-wrote db gen script in node.js. Fixed 0XXXX bug. Fixed default city bug.
 * Removed jQuery dependency
 * Code/DB cleanup
 * Event driven js

Dependencies
----------

None

Authentication
----------

It is not recommended to use this library for authentication of zip-codes. The primary reason is that zip-codes are added all the time, and someone's zip-code may not exist in this database in real-time.


little something for the effort
----------

 * BTC: 1AT6o3mmPRZVdzXPh7SbThgAhv9g4o3j92

 * PP: ari at asu dot edu