<?php
if (!empty($_GET[name]) && !empty($_GET[message])) {

$name = preg_replace("/[^a-z1-9\-]/",'',strtolower($_GET[name]));
$message = preg_replace("/[^a-zA-Z1-9\-\s]/",'',strtolower(urldecode($_GET[message])));

echo shell_exec("ChainedTalker/Chain/talker.shexe $name \"$message\"");
}?>