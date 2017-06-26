<style>
.you { background-color: #00c7ff;}
.them { background-color: rgb(0,255,255);}
</style>

<?php
if (empty($_GET[name])) {
$parts = explode('/', $_SERVER[REQUEST_URI]);
$last = $parts[count($parts)-1];
if (strpos($last,'.') !== false) array_pop($parts);
$url = join($parts,'/');
?><p>Pick an already created one</p><?
$dir_handle = @opendir('ChainedTalker/Chain/Cache') or die("Unable to open $path");
while (false !== ($file = readdir($dir_handle))) {
    if (substr_compare($file, '.txt', -4) === 0) {
		$name = preg_replace("/\..+/",'',$file);
		echo "<ul><a href='$url?name=$name'>$name</a></ul>";
    }
}
closedir($dir_handle);
?>
<p>or</p>
<form action="index.php" method="get">
	<input type="text" name="name" value="" />
	<input type="submit" value="parse new tumblererer" /></p>
</form>
<p>Warning: Generating a chat file takes a while</p>

<?
} else {
?>
<script>
var person = '<?php echo $_GET[name]; ?>', blocking, tapped, save;
//XMLHttpRequest handler. the function will be called when ready
request = function request(mess) {
	blocking = true;
	tapped = false;
	var req=new XMLHttpRequest();
	save = Date.now();
	req.onreadystatechange=function() {
		if (req.readyState===4 && req.status===200) {
			var a = 1000 - Date.now() + save;
			a = (a<0)?0:a;
			setTimeout(
			function(){
				data.innerHTML+="<div class='them'><p>"+req.responseText+"</p></div>";
				data.scrollTop = data.scrollHeight;
				blocking = false;
				if (tapped) {
					window.submit();
					tapped = false;
				}
				thecoolest.focus();
			},a);
		}
	};
	req.open('GET',"display.php?name="+person+"&message="+mess,true);
	req.send();
}
submit = function submit() {
	if (!blocking) {
		data.innerHTML+="<div class='you'><p>"+thecoolest.value+"</p></div>";
		data.scrollTop = data.scrollHeight;
		thecoolest.value = "";
		thecoolest.blur();
		var abss="",s=(data.children.length>8)?data.children.length-8:0;
		for (var d=s; d<data.children.length; d++) { // the newly added div is contained in this
			abss += data.children[d].textContent + "  ";
		}
		request(abss);
	} else {
		tapped = true;
	}
}
</script>
<?
	$name = preg_replace("/[^a-z1-9\-]/",'',strtolower($_GET[name]));
	if (!file_exists("ChainedTalker/Chain/Cache/$name.txt"))
		exec("ChainedTalker/gen.shexe $name");
?>
<div id="data" style="overflow:auto;height: calc(100% - 4em);width:100%"></div>
<input id="thecoolest" style="width:100%;height: 4em;" onkeyup="if (13===(event.which | event.keyCode)) submit();"/>
<?php
}?>