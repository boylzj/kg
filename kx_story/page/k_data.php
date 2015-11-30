<?php
$callback = $_REQUEST["callback"];

echo $callback . "([" ;

  include_once('data_cache.php');
  
  for($i=0; $i<100; $i++){
    $data = $d_cache[$i];
    echo "[{$data[0]}, {$data[1]}, {$data[2]}, {$data[3]}, {$data[4]}, {$data[5]}]";
    if($i<99) echo ",";
  }
  
echo "]);"
?>