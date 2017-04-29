/**
 * This script downloads and parses a postcode database, and generates look up files.
 */

var https =      require('https'),
    fs =        require('fs'),
    readline =  require('readline');


var DB_PATH = __dirname  + '/uk';
var FILE_FORMAT = DB_PATH  + '/{group}.js';
var INDEX_POSTCODES = 0;
var INDEX_TOWNS_AREAS = 1;
var INDEX_REGIONS = 2;
var JSONP_FUNC = "__zl";



exports.genUK = genUK;
var POSTCODE_CSV_URL = 'https://www.doogal.co.uk/PostcodeDistrictsCSV.ashx';
var headers = null;
var curObj = null;
function genUK() {

    if (!fs.existsSync(DB_PATH))
        fs.mkdirSync(DB_PATH);

    console.log("Streaming UK Database: " + POSTCODE_CSV_URL);
    https.get(POSTCODE_CSV_URL, function(response) {
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
                obj[headers[i].toLowerCase().replace("/", "")] = arr[i];

            if(!curObj || curObj.region !== obj.region)
                console.log("Processing Region: " + (curObj = obj).region);

            addRecord(obj);
            //console.log(arr);
        }).on('close', function() {
            console.log(groups);

        });
    });
}

var groups = {};

function addRecord(obj) {
    var postcode = obj.postcode;
    // Postcode does not have a decimal suffix, therefore it is ignored.
    if (postcode.search(/\d/) === -1)
        return;
    var groupName = postcode.substr(0, postcode.search(/\d/));
    var regionName = ukRegions[groupName];
    if(!regionName)
        throw new Error("Could not find region: " + obj.region);
    var townAreaName = obj.townarea.toUpperCase();
    var subGroupName = postcode.substr(postcode.search(/\d/));
    var fileName = FILE_FORMAT
        .replace(/\{group\}/i, groupName)
        .toLowerCase();

    var groupData =
        typeof groups[groupName] === 'object'
        ? groups[groupName]
        : (groups[groupName] = [{},[],[]]);

    var regionKey = groupName + '|' + regionName;
    var regionPos = groupData[INDEX_REGIONS].indexOf(regionKey);
    if(regionPos === -1)
        groupData[INDEX_REGIONS][regionPos = groupData[INDEX_REGIONS].length] = regionKey;

    var townAreaKey = townAreaName + (regionPos ? '|' + regionPos : '');
    var townAreaPos = groupData[INDEX_TOWNS_AREAS].indexOf(townAreaKey);
    if(townAreaPos === -1)
        groupData[INDEX_TOWNS_AREAS][townAreaPos = groupData[INDEX_TOWNS_AREAS].length] = townAreaKey;

    if(typeof groupData[INDEX_POSTCODES][subGroupName] === 'undefined')
        groupData[INDEX_POSTCODES][subGroupName] = townAreaPos;

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
    console.log(a.join(", "));
    return a;
}

function titleCase(str) {
    return str.toUpperCase()
        .replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
            return $1.toUpperCase();
        });
}

var ukRegions ={
    "AB":"Aberdeen",
    "AL":"St Albans",
    "B":"Birmingham",
    "BA":"Bath",
    "BB":"Blackburn",
    "BD":"Bradford",
    "BH":"Bournemouth",
    "BL":"Bolton",
    "BN":"Brighton",
    "BR":"Bromley",
    "BS":"Bristol",
    "BT":"Northern Ireland",
    "CA":"Carlisle",
    "CB":"Cambridge",
    "CF":"Cardiff",
    "CH":"Chester",
    "CM":"Chelmsford",
    "CO":"Colchester",
    "CR":"Croydon",
    "CT":"Canterbury",
    "CV":"Coventry",
    "CW":"Crewe",
    "DA":"Dartford",
    "DD":"Dundee",
    "DE":"Derby",
    "DG":"Dumfries and Galloway",
    "DH":"Durham",
    "DL":"Darlington",
    "DN":"Doncaster",
    "DT":"Dorchester",
    "DY":"Dudley",
    "E":"East London",
    "EC":"Central London",
    "EH":"Edinburgh",
    "EN":"Enfield",
    "EX":"Exeter",
    "FK":"Falkirk and Stirling",
    "FY":"Blackpool",
    "G":"Glasgow",
    "GL":"Gloucester",
    "GU":"Guildford",
    "GY":"Guernsey",
    "HA":"Harrow",
    "HD":"Huddersfield",
    "HG":"Harrogate",
    "HP":"Hemel Hempstead",
    "HR":"Hereford",
    "HS":"Outer Hebrides",
    "HU":"Hull",
    "HX":"Halifax",
    "IG":"Ilford",
    "IP":"Ipswich",
    "IV":"Inverness",
    "IM":"Isle of Man",
    "JE":"Jersey",
    "KA":"Kilmarnock",
    "KT":"Kingston upon Thames",
    "KW":"Kirkwall",
    "KY":"Kirkcaldy",
    "L":"Liverpool",
    "LA":"Lancaster",
    "LD":"Llandrindod Wells",
    "LE":"Leicester",
    "LL":"Llandudno",
    "LN":"Lincoln",
    "LS":"Leeds",
    "LU":"Luton",
    "M":"Manchester",
    "ME":"Rochester",
    "MK":"Milton Keynes",
    "ML":"Motherwell",
    "N":"North London",
    "NE":"Newcastle upon Tyne",
    "NG":"Nottingham",
    "NN":"Northampton",
    "NP":"Newport",
    "NR":"Norwich",
    "NW":"North West London",
    "OL":"Oldham",
    "OX":"Oxford",
    "PA":"Paisley",
    "PE":"Peterborough",
    "PH":"Perth",
    "PL":"Plymouth",
    "PO":"Portsmouth",
    "PR":"Preston",
    "RG":"Reading",
    "RH":"Redhill",
    "RM":"Romford",
    "S":"Sheffield",
    "SA":"Swansea",
    "SE":"South East London",
    "SG":"Stevenage",
    "SK":"Stockport",
    "SL":"Slough",
    "SM":"Sutton",
    "SN":"Swindon",
    "SO":"Southampton",
    "SP":"Salisbury",
    "SR":"Sunderland",
    "SS":"Southend-on-Sea",
    "ST":"Stoke-on-Trent",
    "SW":"South West London",
    "SY":"Shrewsbury",
    "TA":"Taunton",
    "TD":"Galashiels",
    "TF":"Telford",
    "TN":"Tonbridge",
    "TQ":"Torquay",
    "TR":"Truro",
    "TS":"Cleveland",
    "TW":"Twickenham",
    "UB":"Southall",
    "W":"West London",
    "WA":"Warrington",
    "WC":"Central London",
    "WD":"Watford",
    "WF":"Wakefield",
    "WN":"Wigan",
    "WR":"Worcester",
    "WS":"Walsall",
    "WV":"Wolverhampton",
    "YO":"York",
    "ZE":"Lerwick"
};
