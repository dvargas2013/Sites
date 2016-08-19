<?php
require_once 'functions.php';
$id = $_GET[id];
$char = DataBase::getCharacter($id);
if (!$char) die("404 - Character id Not available");
$concatname = DataBase::getConcatName($id)[longname];
?>
<head>
<title><?php echo $concatname; ?></title>
</head>
<body>
	<form action="edit.php" method="post">
	
	<h1><?php echo $concatname; ?></h1>
	<input hidden name="id" value="<? echo $id; ?>">
	
	<fieldset>
	<section>
	<p><span>Species:</span>
		<select name="species">
			<?
			foreach (Database::getSpecies() as $row) {
				$name = $row[genus];
				if ($row[species] !== '_') $name .= " ($row[species])";
				echo "<option ";
				if ($row[id] === $char[species]) echo "selected ";
				echo "value='$row[id]'>$name<"."/option>";
			}
			?>
		</select>
		<a href="addspecies.php">Add Another Species</a>
	</p>
	</section>

	<section>
	<p><span>Age:</span>
		<select name="age">
			<?
			foreach (Database::getAges() as $row) {
				echo "<option ";
				if ($row[type] === $char[age]) echo "selected ";
				echo "value='$row[type]'>$row[type]<"."/option>";
			}?>
		</select>
	</p>
	</section>
	
	<section>
	<p><span>Gender:</span>
		<select name="gender">
			<?
			foreach (Database::getGenders() as $row) {
				echo "<option ";
				if ($row[gender] === $char[gender]) echo "selected ";
				echo "value='$row[gender]'>$row[gender]<"."/option>";
			}?>
		</select>
	</p>
	</section>
	
	<section>
	<p><span>Alignment:</span>
		<select name="alignment">
			<?
			foreach (Database::getAlignments() as $row) {
				echo "<option ";
				if ($row[name] === $char[alignment]) echo "selected ";
				echo "value='$row[name]'>$row[name]<"."/option>";
			}?>
		</select>
	</p>
	</section>
	
	<section>
	<p><span>Power:</span>
		<input type="text" name="power" value="<? echo $char[power]?>" />
	</p>
	</section>
	
	<section>
	<p><span>Generation:</span>
		<input type="text" maxlength="1" name="generation" value="<? echo $char[generation]?>" onblur='this.value=parseInt(this.value)' />
	</p>
	</section>
	
	</fieldset>
	
	<section>
	<h2>Booleans</h2>
	<?php
	foreach (DataBase::getBooleans() as $bool) {
		echo "<fieldset><legend>$bool[name]?</legend>";
		$charboolval = DataBase::getBool($id,$bool[name]);
		$no = (empty($charboolval) ||  $charboolval[value])?"":"checked";
		$yes =(empty($charboolval) || !$charboolval[value])?"":"checked"; 
		echo "<input type='radio' name='bool:$bool[name]' value='0' $no />no";
		echo "<input type='radio' name='bool:$bool[name]' value='1' $yes />yes";
		echo "</fieldset>";
	}
	?>
	</section>
	
	<section>
	<h2 id="parents">Parents</h2>
	<fieldset>
	<?php
	foreach (DataBase::getParents($id) as $row) {
// 		$charboolval = DataBase::getBool($id,$bool[name]);
// 		$no = (empty($charboolval) ||  $charboolval[value])?"":"checked";
// 		$yes =(empty($charboolval) || !$charboolval[value])?"":"checked";
// 		echo "<input type='radio' name='bool:$bool[name]' value='0' $no />no";
// 		echo "<input type='radio' name='bool:$bool[name]' value='1' $yes />yes";
	}
	?>
	<a href="#parents" id="addParents" onclick="addTheParents()">Add More Parents</a>
	</fieldset>
	</section>
	
	<section>
	<h2 id="children">Children</h2>
	<fieldset>
	<?php
	foreach (DataBase::getChildren($id) as $row) {
// 		$charboolval = DataBase::getBool($id,$bool[name]);
// 		$no = (empty($charboolval) ||  $charboolval[value])?"":"checked";
// 		$yes =(empty($charboolval) || !$charboolval[value])?"":"checked";
// 		echo "<input type='radio' name='bool:$bool[name]' value='0' $no />no";
// 		echo "<input type='radio' name='bool:$bool[name]' value='1' $yes />yes";
	}
	?>
	<a href="#children" id="addChildren" onclick="addTheChildren()">Add More Children</a>
	</fieldset>
	</section>
	
	<section>
	<h2 style="display:inline-block" id="colors">Colors</h2><h6 style="display:inline-block;padding-left:10px"><a href="addcolor.php">Add Another Color</a></h6>
	<fieldset id="mcfs"><legend>MainColor</legend>
		<?
		$allcolors = Database::getColors();
		foreach ($allcolors as $row) {
			echo "<span style='background-color: $row[hex]'>";
			echo "<input type='radio' ";
			if ($row[name] === $char[main_color]) echo "checked ";
			echo "name='main_color' value='$row[name]'>$row[name]</input>";
			echo "<"."/span>";
		}?>
	</fieldset>
	<?
	$bodycolors = Database::getBodyColors($id);
	if ($bodycolors) {
	foreach ($bodycolors as $brow) {
		echo "<fieldset><legend><input name='bodypart:$brow[bodypart]' value='$brow[bodypart]'></legend>";
		foreach ($allcolors as $row) {
			echo "<span style='background-color: $row[hex]'><input type='radio' ";
			if ($row[name] === $brow[color]) echo "checked ";
			echo "name='bodypartcolor:$brow[bodypart]' value='$row[name]'>$row[name]</input><"."/span>";
		}
		echo "</fieldset>";
	}}?>
	<script>
	var addTheBodyColors=function addTheBodyColors(){
		var p=document.createElement('fieldset');
		var bodypartlen = addColors.parentElement.children.length;
		p.innerHTML = "<legend><input name='bodypartnew:"+bodypartlen+"'></legend>";
		var spans = mcfs.getElementsByTagName('span');
		for (var i=0,span=spans[0];i<spans.length;span=spans[++i])
			p.innerHTML += "<span style='"+span.attributes.style.value+"'><input type='radio' name='bodypartcolornew:"+bodypartlen+"' value='"+span.innerText+"'>"+span.innerText+"</input></span>";
		addColors.parentElement.insertBefore(p,addColors);
	}
	</script>
	<a href="#colors" id="addColors" onclick="addTheBodyColors()">Add More Colors</a>
	</section>
	
	<section>
	<h2 id="extra">Extra Infoes</h2> 
	<?
	$extras = DataBase::getExtras($id);
	if ($extras) {
	foreach ($extras as $row)
		echo "<input style='width:100%' type='text' name='extra:$row[text]' value='$row[text]' />";
	}?>
	<script>
	var addTheInfoes=function addTheInfoes(){
		var p=document.createElement('p');
		p.innerHTML = "<input style='width:100%' type='text' name='extranew:"+addInfo.parentElement.children.length+"' />";
		addInfo.parentElement.insertBefore(p.children[0],addInfo);
	}
	</script>
	<a href="#extra" id="addInfo" onclick="addTheInfoes()">Add More Infoes</a>
	</section>
	
	<section>
	<p><input type="submit" /></p>
	</section>
	
	</form>
</body>