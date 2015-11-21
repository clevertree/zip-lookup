/**
 * Created by ari on 10/2/2015.
 *
 * This script downloads and parses a zipcode database, and generates look up files. 
 */

var http =      require('http'),
    fs =        require('fs'),
    readline =  require('readline');


var GROUP_LENGTH = 2;
var DB_PATH = __dirname  + '/us';
var FILE_FORMAT = DB_PATH  + '/{group}.js';
var INDEX_ZIPS = 0;
var INDEX_CITIES = 1;
var INDEX_STATES = 2;
var JSONP_FUNC = "__zl";



exports.genUS = genUS;
var ZIP_CSV_URL = 'http://federalgovernmentzipcodes.us/free-zipcode-database-Primary.csv';
var headers = null;
var curObj = null;
function genUS() {

    if (!fs.existsSync(DB_PATH))
        fs.mkdirSync(DB_PATH);

    //var file = fs.createWriteStream("us.csv");
    console.log("Streaming US Database: " + ZIP_CSV_URL);
    http.get(ZIP_CSV_URL, function(response) {
        var lineStream = readline.createInterface({
            input: response,
            output: process.stdout
        }).on('line', function (line) {
            if(headers === null) {
                headers = CSVtoArray(line);
                console.log("Found headers: ", headers.join(", "));
                return;
            }
            var arr = CSVtoArray(line);
            var obj = {};
            for(var i=0; i<arr.length; i++)
                obj[headers[i].toLowerCase()] = arr[i];

            if(!curObj || curObj.state !== obj.state)
                console.log("Processing State: " + (curObj = obj).state);

            addRecord(obj);
            //console.log(arr);
        }).on('close', function() {
            console.log(groups);

        });
    });
}

var groups = {};

function addRecord(obj) {
    var stateAbbr = obj.state.toUpperCase();
    var stateName = usStates[obj.state.toUpperCase()];
    if(!stateName)
        throw new Error("Could not find state: " + obj.state);

    var cityName = obj.city;
    var paddedZipcode =
            ['00000', '0000', '000', '00', '0', '']
            [(obj.zipcode + '').length] +
        obj.zipcode;

    var groupName = paddedZipcode.substr(0, GROUP_LENGTH);
    var subGroupName = paddedZipcode.substr(GROUP_LENGTH);
    var fileName = FILE_FORMAT
        .replace(/\{group\}/i, groupName)
        .toLowerCase();

    var groupData =
        typeof groups[groupName] === 'object'
        ? groups[groupName]
        : (groups[groupName] = [{},[],[]]);

    var stateKey = stateAbbr + '|' + stateName;
    var statePos = groupData[INDEX_STATES].indexOf(stateKey);
    if(statePos === -1)
        groupData[INDEX_STATES][statePos = groupData[INDEX_STATES].length] = stateKey;

    var cityKey = cityName + (statePos ? '|' + statePos : '');
    var cityPos = groupData[INDEX_CITIES].indexOf(cityKey);
    if(cityPos === -1)
        groupData[INDEX_CITIES][cityPos = groupData[INDEX_CITIES].length] = cityKey;

    if(typeof groupData[INDEX_ZIPS][subGroupName] === 'undefined')
        groupData[INDEX_ZIPS][subGroupName] = cityPos;

    //console.log("Writing: ", JSONP_FUNC + "(" + JSON.stringify(groupData) + ");");
    fs.writeFileSync(fileName, JSONP_FUNC + "(" + JSON.stringify(groupData) + ");");
}


// Return array of string values, or NULL if CSV string not well formed.
function CSVtoArray(text) {
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;
    var a = [];                     // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
        function(m0, m1, m2, m3) {
            // Remove backslash from \' in single quoted values.
            if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        });
    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
}

function titleCase(str) {
    return str.toUpperCase()
        .replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
            return $1.toUpperCase();
        });
}

var usStates ={
    "AE":"AE",
    "AA":"AA",
    "AP":"AP",

    "AL":"Alabama",
    "AK":"Alaska",
    "AS":"American Samoa",
    "AZ":"Arizona",
    "AR":"Arkansas",
    "CA":"California",
    "CO":"Colorado",
    "CT":"Connecticut",
    "DE":"Delaware",
    "DC":"District Of Columbia",
    "FM":"Federated States Of Micronesia",
    "FL":"Florida",
    "GA":"Georgia",
    "GU":"Guam",
    "HI":"Hawaii",
    "ID":"Idaho",
    "IL":"Illinois",
    "IN":"Indiana",
    "IA":"Iowa",
    "KS":"Kansas",
    "KY":"Kentucky",
    "LA":"Louisiana",
    "ME":"Maine",
    "MH":"Marshall Islands",
    "MD":"Maryland",
    "MA":"Massachusetts",
    "MI":"Michigan",
    "MN":"Minnesota",
    "MS":"Mississippi",
    "MO":"Missouri",
    "MT":"Montana",
    "NE":"Nebraska",
    "NV":"Nevada",
    "NH":"New Hampshire",
    "NJ":"New Jersey",
    "NM":"New Mexico",
    "NY":"New York",
    "NC":"North Carolina",
    "ND":"North Dakota",
    "MP":"Northern Mariana Islands",
    "OH":"Ohio",
    "OK":"Oklahoma",
    "OR":"Oregon",
    "PW":"Palau",
    "PA":"Pennsylvania",
    "PR":"Puerto Rico",
    "RI":"Rhode Island",
    "SC":"South Carolina",
    "SD":"South Dakota",
    "TN":"Tennessee",
    "TX":"Texas",
    "UT":"Utah",
    "VT":"Vermont",
    "VI":"Virgin Islands",
    "VA":"Virginia",
    "WA":"Washington",
    "WV":"West Virginia",
    "WI":"Wisconsin",
    "WY":"Wyoming"
};
