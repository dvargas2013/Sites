<?php
class DataBase {
    public static $dbh;
	// [{id,longname},...]
	public static function getNames() {
		$stmt =  self::$dbh->prepare("SELECT id,Group_Concat(name,' / ') as longname FROM (SELECT id,name FROM NAMES ORDER BY length(name)) GROUP BY id");
		if ($stmt->execute())
			return $stmt->fetchAll();
	}
	// [{type,sortkey},...]
	public static function getAges() {
		$stmt =  self::$dbh->prepare("SELECT * FROM _AGE ORDER BY sortkey");
		if ($stmt->execute())
			return $stmt->fetchAll();
	}
	// [{name},...]
	public static function getAlignments() {
		$stmt =  self::$dbh->prepare("SELECT * FROM _ALIGNMENTS");
		if ($stmt->execute())
			return $stmt->fetchAll();
	}
	// [{name},...]
	public static function getBooleans() {
		$stmt =  self::$dbh->prepare("SELECT * FROM _BOOLEANS");
		if ($stmt->execute())
			return $stmt->fetchAll();
	}
	// [{id,genus,species},...]
	public static function getSpecies() {
		$stmt =  self::$dbh->prepare("SELECT * FROM _SPECIES ORDER BY genus,species COLLATE NOCASE");
		if ($stmt->execute())
			return $stmt->fetchAll();
	}
	// [{gender},...]
	public static function getGenders() {
		$stmt =  self::$dbh->prepare("SELECT * FROM _GENDERS");
		if ($stmt->execute())
			return $stmt->fetchAll();
	}
	// [{name,hexid},...]
	public static function getColors() {
		$stmt =  self::$dbh->prepare("SELECT * FROM _COLORS");
		if ($stmt->execute())
			return $stmt->fetchAll();
	}
	// {longname}
	public static function getConcatName($id) {
		$stmt =  self::$dbh->prepare("SELECT Group_Concat(name,' / ') as longname FROM (SELECT name FROM NAMES WHERE id = ? ORDER BY length(name)) LIMIT 1");
		if ($stmt->execute([$id]))
			return $stmt->fetch();
	}
	// {name}
	public static function getShortestName($id) {
		$stmt =  self::$dbh->prepare("SELECT name FROM NAMES WHERE id = ? ORDER BY length(name) ASC LIMIT 1");
		if ($stmt->execute([$id]))
			return $stmt->fetch();
	}
	// {name}
	public static function getLongestName($id) {
		$stmt =  self::$dbh->prepare("SELECT name FROM NAMES WHERE id = ? ORDER BY length(name) DESC LIMIT 1");
		if ($stmt->execute([$id]))
			return $stmt->fetch();
	}
	// [{id,text,...},...]
	public static function getExtras($id) {
		$stmt =  self::$dbh->prepare("SELECT * FROM EXTRAINFO WHERE id = ? ORDER BY length(text)");
		if ($stmt->execute([$id]))
			return $stmt->fetchAll();
	}
	// {charid,boolname,value}
	public static function getBool($id,$boolname) {
		$stmt =  self::$dbh->prepare("SELECT * FROM BOOLEANS WHERE charid = ? and boolname = ? LIMIT 1");
		if ($stmt->execute([$id,$boolname]))
			return $stmt->fetch();
	}
	// [{idparent,idchild},...]
	public static function getChildren($id) {
		$stmt =  self::$dbh->prepare("SELECT * FROM PARENTAGE WHERE idparent = ?");
		if ($stmt->execute([$id]))
			return $stmt->fetchAll();
	}
	// [{idparent,idchild},...]
	public static function getParents($id) {
		$stmt =  self::$dbh->prepare("SELECT * FROM PARENTAGE WHERE idchild = ?");
		if ($stmt->execute([$id]))
			return $stmt->fetchAll();
	}
	// {id,species,main_color,gender,age,power,alignment,generation}
	public static function getCharacter($id) {
		$stmt =  self::$dbh->prepare("SELECT * FROM CHARACTERS WHERE id = ? LIMIT 1");
		if ($stmt->execute([$id]))
			return $stmt->fetch();
	}
	// [{id,bodypart,color},...]
	public static function getBodyColors($id) {
		$stmt =  self::$dbh->prepare("SELECT * FROM BODYCOLORS WHERE id = ?");
		if ($stmt->execute([$id]))
			return $stmt->fetchAll();
	}
}
DataBase::$dbh = new PDO('sqlite:database/Characters.db') or die("cannot open the database");
DataBase::$dbh->query('PRAGMA foreign_keys = ON');
?>