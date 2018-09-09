<?php 
function run($name) {
$command = escapeshellcmd('./dAPplFinder.shexe '.$name);
return shell_exec($command);
}
header('Location: '.'index.html#'.$_GET['name']);
file_put_contents("output.txt", run($_GET['name']), FILE_APPEND);
?>