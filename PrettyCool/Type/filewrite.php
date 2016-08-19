<h2>File Writing PHP</h2>
<form method="post" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']);?>">  
  <input type="text" name="name" placeholder="Type Something Yay" style="margin:auto;width:100%;display:block"></input>
    <input type="submit" name="submit" value="Submit (or just press Enter)" style="margin:auto;display:block">
	    <input type="submit" name="erase" value="Be a Jerk and Erase the File" style="position: absolute;right: 0;bottom: 0;opacity: .1;">
</form><h3>File Contents So Far:</h3><div style="overflow-y: scroll;bottom: 0;position: absolute;width: calc(100% - 10px);">
<?php
function validate_input($data) {
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}

$data="<p>".validate_input($_POST['name'])."</p>\n";

$file = 'people.txt';

if (empty($_POST['erase'])) {
	file_put_contents($file, $data, FILE_APPEND);
	$print=str_replace("<p></p>","",file_get_contents($file));
	$print=str_replace("\n\n","\n",$print);
	$print=preg_replace_callback("/(&amp;#[0-9]+;)/", function($m) { return mb_convert_encoding($m[0], "UTF-8", "HTML-ENTITIES"); }, $print);
	echo $print;
	file_put_contents($file, $print);
} else {
	file_put_contents($file, "");
}
?>
</div>