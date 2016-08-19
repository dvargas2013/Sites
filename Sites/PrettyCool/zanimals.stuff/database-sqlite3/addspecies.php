<?php
require 'functions.php';

if (empty($_POST)) {
	$genuses = DataBase::$dbh->query("SELECT * FROM __GENUSES");
	$species = DataBase::$dbh->query("SELECT * FROM _SPECIES");
?>
<head>
<title>Add New Species</title>
</head>
<body>
	<form action="addspecies.php" method="post">
	
	<section>
	<p><span>Genus:</span>
		<select name="genuslist">
			<?
			foreach ($genuses as $row)
				echo "<option value='$row[genus]'>$row[genus]</option>";
			?>
		</select>
		<input name="genustext"></input>
	</p>
	</section>
	
	<section>
	<p><span>Species:</span>
		<input name="species" value="_" onblur="if (this.value==='') this.value='_'"></input>
	</p>
	</section>
	
	<section>
	<p><input type="submit" value="Make New Species" /></p>
	</section>
	
	</form>
</body>
<?} else {
	$genus;
	if (empty($_POST[genustext]))
		$genus = $_POST[genuslist];
	 else {
		$genus = $_POST[genustext];
		$stmt = DataBase::$dbh->prepare("INSERT INTO `__GENUSES` (`genus`) VALUES (?)");
		if (!$stmt->execute([$genus]))
			die("Error making genus $genus");
	}
	$species = $_POST[species];
		
	$stmt = DataBase::$dbh->prepare("INSERT INTO `_SPECIES` (`genus`,`species`) VALUES (:genus,:species)");
	$stmt->bindParam('genus',$genus);
	$stmt->bindParam('species',$species);
	if (!$stmt->execute())
		die("Error adding ($genus,$species)");
	
	echo "<p>($genus,$species) added</p>";
	include 'list.php';
}?>