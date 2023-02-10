<?php 

  // регулярное выражение:  /[0-9]+[\+\-\/\*]*/
  // пример: "55123+123123/124124*55"
  // name array: $regValidateValue
  // метод: preg_match_all("reg", "пример", "твой name array")

  $form_data = file_get_contents("php://input");
  $form_data = json_decode($form_data, true);

  preg_match_all("/[0-9]+[\+\-\/\*]*/", $form_data["postData"], $regValidateValue);

  $regularArray = [
    "numbers" => [],
    "operations" => [],
  ];

  setRegularArray();
  echo json_encode(
    getMathResult()
  );

  function setRegularArray() {
    global $regValidateValue, $regularArray;
    
    foreach($regValidateValue[0] as $key => $value) {
      if($key >= count($regValidateValue[0]) - 1) {
        array_push($regularArray["numbers"], $regValidateValue[0][$key]);
      } else {
        array_push($regularArray["numbers"], substr($value, 0, -1));
        array_push($regularArray["operations"], substr($value, -1));
      }
    }
  }

  function getMathResult() {
    global $regularArray;
    $result = 0;

    foreach($regularArray["numbers"] as $key => $value) {
      if($key > count($regularArray["numbers"]) - 1) {
        return;
      }

      if($key === 0) {
        $result = playCalc($regularArray["operations"][$key], $regularArray["numbers"][$key], $regularArray["numbers"][$key + 1]);
      }

      if($key > 0 && $key < count($regularArray["numbers"]) - 1) {
        $result = playCalc($regularArray["operations"][$key], $result, $regularArray["numbers"][$key + 1]);
      }     
    }

    return [
      "status" => "ok", 
      "result" => $result 
    ];
  }


  function playCalc($operator, $value, $afterValue) {
    $value = (int) $value;
    $afterValue = (int) $afterValue;

    if($operator === "+") {
      return $value + $afterValue;
    }

    if($operator === "-") {
      return $value - $afterValue;
    }

    if($operator === "/") {
      return $value / $afterValue;
    }

    if($operator === "*") {
      return $value * $afterValue;
    }
  }

?>
