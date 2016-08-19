<?php
require 'functions.php';

if (empty($_POST)) {
?>
<head>
<title>Add New Character</title>
</head>
<body>
	<form action="addcharacter.php" method="post">
	
	<section>
	<p><input type="text" name="name" value="" /></p>
	</section>
	
	<section>
	<p><input type="submit" value="Make New Character" /></p>
	</section>
	
	</form>
</body>
<?} else {
	$name = $_POST[name];
	
	DataBase::$dbh->query("INSERT INTO CHARACTERS (`species`,`generation`,`isVampire`,`hasTail`) VALUES (1,0,0,0);");
	$stmt = DataBase::$dbh->prepare("SELECT max(id) FROM CHARACTERS");
	$stmt->execute();
	$id = $stmt->fetch()[0];
	
	$stmt = DataBase::$dbh->prepare("INSERT INTO NAMES (`id`,`name`) VALUES (:id,:name)");
	$stmt->bindParam('name',$name);
	$stmt->bindParam('id',$id);
	if (!$stmt->execute()) {
		echo("<p>if you are seeing this error tell someone cause I need to delete the partially made character</p>");
		echo("<p>i dont need your half made characters cluttering the inner linings of my database</p>");
		echo("<p>it wont show up anywhere without a name so dont worry. its just performance im worried about</p>");
		die("Error adding ($id, $name)");
	}
	
	echo "<p>$name added</p>";
	include 'list.php';
}?>