<?php
$dir = 'sqlite:test.db';
$dbh  = new PDO($dir) or die("cannot open the database");
$stmt =  $dbh->prepare("SELECT names FROM NICE");
if ($stmt->execute()) {
	foreach ($stmt->fetchAll() as $row) {
		echo "<p>".$row[names]."</p>";
	}
}
?>