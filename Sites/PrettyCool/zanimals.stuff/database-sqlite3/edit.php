<?php
require 'functions.php';
//Database::$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
var_dump($_POST);

// id - there's no way you'd find a way to change this
$id = $_POST['id'];

// these are all directly displayed and can be changed directly as a result
// species // age // gender // alignment // power // generation // isVampire // hasTail // main_color
$stmt = DataBase::$dbh->prepare("UPDATE CHARACTERS SET species=:species, age=:age, gender=:gender, alignment=:alignment, power=:power, generation=:generation, main_color=:main_color WHERE id=:id");
$stmt->bindValue('id',$id);
$stmt->bindValue('species',$_POST['species']);
$stmt->bindValue('age',$_POST['age']);
$stmt->bindValue('gender',$_POST['gender']);
$stmt->bindValue('alignment',$_POST['alignment']);
$stmt->bindValue('power',$_POST['power']);
$stmt->bindValue('generation',$_POST['generation']);
$stmt->bindValue('main_color',$_POST['main_color']);
if (!$stmt->execute())
	die("Quick Start Bad Ouch");

// these have their own tables

function endsWith($haystack, $needle) {
    return $needle === "" || (($temp = strlen($haystack) - strlen($needle)) >= 0 && strpos($haystack, $needle, $temp) !== false);
}

foreach($_POST as $key => $value){
    $exp_key = explode(':', $key, 2);
	switch($exp_key[0]) {
		case 'bodypart':
			// X is the old bodypart
			// bodypart:X - change name | delete if nothing
			// bodypartcolor:X - set color | delete if nothing
			$bodypart = $exp_key[1];
			$newname = $value;
			$newcolor = $_POST["bodypartcolor:".$bodypart];
			if (empty($newname) || !isset($newcolor)){
				// delete ($id,$bodypart)
				$stmt = DataBase::$dbh->prepare("DELETE FROM BODYCOLORS WHERE id=:id and bodypart=:bodypart");
				$stmt->bindValue('id',$id);
				$stmt->bindValue('bodypart',str_replace("_"," ",$bodypart));
				if ($stmt->execute()) echo "<p>Deleted $bodypart</p>";
		 	   	else echo "<p>Failed to delete $bodypart</p>";
			} else {
				// set ($id,$bodypart) to ($id,$newname,$newcolor)
				$stmt = DataBase::$dbh->prepare("UPDATE BODYCOLORS SET bodypart=:newname, color=:newcolor where id=:id and bodypart=:bodypart");
				$stmt->bindValue('id',$id);
				$stmt->bindValue('bodypart',str_replace("_"," ",$bodypart));
				$stmt->bindValue('newname',$newname);
				$stmt->bindValue('newcolor',$newcolor);
				if (!$stmt->execute()) echo "<p>Failed to update $bodypart to ($newname,$newcolor)</p>";
			}
		break;
		case 'bodypartnew':
			// # is the index number of its creation.
			// bodypartnew:# create name | do nothing if nothing
			// bodypartcolornew:# - set color | do nothing if nothing
			$bodynewid = $exp_key[1];
			$newname = $value;
			$newcolor = $_POST["bodypartcolornew:".$bodynewid];
			if (!empty($newname) && isset($newcolor)) {
				// CREATE ($id,$newname,$newcolor)
				$stmt = DataBase::$dbh->prepare("INSERT INTO BODYCOLORS (`id`,`bodypart`,`color`) VALUES (:id,:bodypart,:color)");
				$stmt->bindValue('id',$id);
				$stmt->bindValue('bodypart',$newname);
				$stmt->bindValue('color',$newcolor);
				if ($stmt->execute()) echo "<p>Created ($newname,$newcolor)</p>";
		 	   	else echo "<p>Failed to create ($newname,$newcolor)</p>";
			}
		break;
		case 'extra':
			// extra:X - change text | delete if nothing
			$oldtext = $exp_key[1];
			$newtext = $value;
			
			if (empty($newtext)) {
				// delete ($id,$oldtext)
				$stmt = DataBase::$dbh->prepare("DELETE FROM EXTRAINFO WHERE id=:id and `text`=:oldtext");
				$stmt->bindValue('id',$id);
				$stmt->bindValue('oldtext',str_replace("_"," ",$oldtext));
				if ($stmt->execute()) echo "<p>Deleted $oldtext</p>";
		 	   	else echo "<p>Failed to delete $oldtext</p>";
			} else {
				// set ($id,$oldtext) to ($id,$newtext)
				$stmt = DataBase::$dbh->prepare("UPDATE EXTRAINFO SET `text`=:newtext WHERE id=:id and `text`=:oldtext");
				$stmt->bindValue('id',$id);
				$stmt->bindValue('oldtext',str_replace("_"," ",$oldtext));
				$stmt->bindValue('newtext',$newtext);
				if (!$stmt->execute()) echo "<p>Failed to update $oldtext to $newtext</p>";
			}
		break;
		case 'extranew':
			// extranew:# - create text | dont if nothing
			$textkey = $exp_key[1];
			$newtext = $value;
			if (!empty($newtext)) {
				// CREATE ($id,$newtext) to ($id,$newtext)
				$stmt = DataBase::$dbh->prepare("INSERT INTO EXTRAINFO (`id`,`text`) VALUES (:id,:newtext)");
				$stmt->bindValue('id',$id);
				$stmt->bindValue('newtext',$newtext);
				if ($stmt->execute()) echo "<p>Created $newtext</p>";
		 	   	else echo "<p>Failed to create $newtext</p>";
			}
		break;
		case 'bool':
			// bool:X - set boolean
			$boolname = $exp_key[1];
			$updatecreate;
			// set ($id,$boolname,$value)
			if (empty(DataBase::getBool($id,str_replace("_"," ",$boolname)))) {
				$stmt = DataBase::$dbh->prepare("INSERT INTO BOOLEANS (charid,boolname,value) VALUES (:id,:boolname,:value)");
				$updatecreate = "create";
			} else {
				$stmt = DataBase::$dbh->prepare("UPDATE BOOLEANS SET value=:value WHERE charid=:id and boolname=:boolname");
				$updatecreate = "update";
			}
			$stmt->bindValue('id',$id);
			$stmt->bindValue('boolname',str_replace("_"," ",$boolname));
			$stmt->bindValue('value',$value);
			if (!$stmt->execute()) echo "<p>Failed to $updatecreate $boolname</p>";
		break;
	}
}

include 'list.php';
?>