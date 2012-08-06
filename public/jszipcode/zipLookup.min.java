/*
 * $.zipLookup v0.1
 *   - by Ari Asulin (ari.asulin at gmail.com)
 *   - jQuery plugin to dynamically fill in City/State Form Fields using an ajax Zipcode lookup
 *   - Apache License, Version 2.0
 *
 */
(function(a){a.extend({zipLookupSetup:function(a){jQuery.extend(jQuery.ajaxSettings,a)},zipLookupSettings:{zipField:null,cityField:null,stateField:null,libPath:"jszipcode/",country:"us",onLookup:function(){},onNotFound:function(){},onError:function(){}},zipLookup:function(b,c,d){if(c instanceof Function){c={onLookup:c}}c=jQuery.extend(true,{},jQuery.zipLookupSettings,c);if(d instanceof Function)c.onNotFound=d;b=parseInt(b);if(!b)throw"Invalid zipVal: "+zipField.val();var e=parseInt(b/100);var f=parseInt(b%100);var g=c.libPath+c.country+"/"+e+".json";a.ajax({url:g,dataType:"json",success:function(a){if(a===undefined||a[0]===undefined)return c.onNotFound();var b=a[0][f];if(a[1][b]===undefined)return c.onNotFound();var d=a[1][b].split("|");var e=d[0];if(!d[1])d[1]=0;var g=d[1];var h=a[2][g].split("|");var i=h[1];var j=h[0];c.onLookup(e,i,j)},fail:function(a,b){c.onError(a,b)}})}})})(jQuery)