<?php
$parts = explode('/', $_SERVER[REQUEST_URI]);
$last = $parts[count($parts)-1];
if (strpos($last,'.') !== false) array_pop($parts);
$url = join($parts,'/');
$needed = ($_SERVER[REQUEST_URI] !== $url);
?>
<div id="Characters">
	<?php
	if ($needed) echo "<a href='$url'>Characters:</a>";
	else  echo "Characters:";
	
	require_once 'functions.php';
	$rows = DataBase::getNames();
	if ($rows) {
		foreach ($rows as $row)
			echo "<ul><a href=display.php?id=".$row[id].">".$row[longname]."</a></ul>";
	}
	?>
</div>
<a href="addcharacter.php">Add new Character</a>