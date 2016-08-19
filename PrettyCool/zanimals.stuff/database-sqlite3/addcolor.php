<?php
require 'functions.php';

if (empty($_POST)) {
?>
<head>
<title>Add New Color</title>
</head>
<body>
	<form action="addcolor.php" method="post">
	
	<section>
	<p><input type="text" name="colorname" value="Color Name" /></p>
	<p><input type="color" name="colorvalue" /></p>
	</section>
	
	<section>
	<p><input type="submit" value="Make New Color" /></p>
	</section>
	
	</form>
</body>
<?} else {
	var_dump($_POST);
	$name = $_POST[colorname];
	$hex = $_POST[colorvalue];
	
	$stmt = DataBase::$dbh->prepare("INSERT INTO `_COLORS` (`name`,`hex`) VALUES (:name,:hex)");
	$stmt->bindParam('name',$name);
	$stmt->bindParam('hex',$hex);
	if (!$stmt->execute())
		die("Error adding ($name, $hex)");

	echo "<p>($name, $hex) added</p>";
	include 'list.php';
}?>