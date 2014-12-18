<?php
/**
 * Created by Ari Asulin.
 * Date: 8/6/12
 * Time: 10:13 AM
 */

define("GROUP_LENGTH", 2);
define("LIBPATH", dirname(__DIR__) .'/public/zip-lookup/db/us/%s.js');
define("INDEX_ZIPS", 0);
define("INDEX_CITIES", 1);
define("INDEX_STATES", 2);
define("JSONP_FUNC", "__zl");

$PDO = new PDO('sqlite:zips.sqlite');
$PDO->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

//$sql = "SELECT `zip` zip, `city` city, `state` state, `st_short` short FROM `zipjoin` limit 20";
$sql_group = "SELECT zip, SUBSTR( trim(zip), 1, " . GROUP_LENGTH . ") AS grp FROM  `zips` GROUP BY grp ORDER BY grp ASC";

$sql_zips = "SELECT zip, city, state, short, SUBSTR( zip, " . (GROUP_LENGTH + 1) . ") as subzip FROM zips WHERE SUBSTR( trim(zip), 1, " . GROUP_LENGTH . ") == :group ";

$sth_zips = $PDO->prepare($sql_zips);
var_dump($PDO->query($sql_group));
foreach ($PDO->query($sql_group) as $row)
{
    $params = array(':group' => $row['grp']); // ':min' => $grp['grp'] * 100 , ':max' => ($grp['grp'] + 1) * 100 );
    $result = $sth_zips->execute($params);
    $json = array();
    $stateLookup = array();
    $cityLookup = array();
    $stCounter = 0;
    $ctCounter = 0;
    while ($zip = $sth_zips->fetch(PDO::FETCH_ASSOC))
    {
        if(!isset($stateLookup[$zip['short']]))
        {
            $stid = $stCounter++;
            $stateLookup[$zip['short']] = array($stid, $zip['short'].'|'.$zip['state']);
        }
        else $stid = $stateLookup[$zip['short']][0];

        if(!isset($cityLookup[$zip['city']]))
        {
            $ctid = $ctCounter++;
            $cityLookup[$zip['city']] = array($ctid, $stid);
        }
        else $ctid = $cityLookup[$zip['city']][0];

        $json[INDEX_ZIPS][$zip['subzip']] = $ctid;
    }
    foreach($cityLookup as $city => $data)
        $json[INDEX_CITIES][($data[0])] = $city.($data[1]==0 ? '' : '|'.$data[1]);
    foreach($stateLookup as $short => $data)
        $json[INDEX_STATES][($data[0])] = $data[1];
    $path = sprintf(LIBPATH, $row['grp']);
    if(!file_exists(dirname($path)))
        mkdir(dirname($path), 777, true);
    file_put_contents($path, JSONP_FUNC."(".json_encode($json, JSON_NUMERIC_CHECK).");");
    echo "Updated File: $path<BR />";
    flush();
}
echo "Done.<BR />";