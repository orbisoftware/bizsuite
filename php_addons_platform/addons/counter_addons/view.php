<?php
$counter = 0;

function incrementCounter() {
    global $counter;
    $counter++;
}

function resetCounter() {
    global $counter;
    $counter = 0;
}

function decrementCounter() {
    global $counter;
    if ($counter > 0) {
        $counter--;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'increment':
                incrementCounter();
                break;
            case 'reset':
                resetCounter();
                break;
            case 'decrement':
                decrementCounter();
                break;
        }
    }
}

header('Content-Type: text/html; charset=utf-8');
if (php_sapi_name() === 'cli-server') {
    $path = __DIR__ . parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
    if (is_file($path)) {
        return false;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Simple Counter</title>
</head>
<body>
  <h1>Counter: <?php echo $counter; ?></h1>

  <button onclick="incrementCounter()">Increment</button>
  <button onclick="resetCounter()">Reset</button>
  <button onclick="decrementCounter()">Decrement</button>
</body>
</html>
