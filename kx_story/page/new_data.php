<?php
  header("Content-type: text/json");
  $num = $_REQUEST["c"];


  include_once('data_cache.php');
  
  $data = $d_cache[$num];
  echo "[{$data[0]}, {$data[1]}, {$data[2]}, {$data[3]}, {$data[4]}, {$data[5]}]";
  
?>