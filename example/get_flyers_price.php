<?php
  $data = json_decode($_POST['data']);
  foreach ($data as $key=>$value) {
    $$key = $value;
  }
  $response = ceil($flyers_total/$flyers_per_page) * ($paper_cost + $print_type * $foreign_exchange) * $tirage_coeff;
  echo floor($response);
?>

