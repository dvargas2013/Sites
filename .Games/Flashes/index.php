<?php
function ListFolder($path) {
	$dir_handle = @opendir($path) or die("Unable to open $path");
	$dirname = explode("/", $path);
	$dirname = end($dirname);
	while (false !== ($file = readdir($dir_handle))) {
		if( $file[0] != "." ) {
			if ( substr_compare($file, '.swf', -4) === 0 ) {
				echo "<ul><div class='swf' onclick=\"swfClick('".$file."')\">".$file."</a></ul>";
			}
		}
	}
	closedir($dir_handle);
}
echo "<div id='delete'>";
ListFolder('.');
echo "</div>";
?>
<style>
	div.swf {
		color: -webkit-link;
		cursor: pointer;
		text-decoration: underline;
	}
</style>
<embed id="swfLoader"></embed>
<script>
	swfClick = function swfClick (file) {
		var loader = document.getElementById('swfLoader');
		if (loader) loader.src = file;
		
		loader.width="95%";
		loader.height="95%";
		
		var del = document.getElementById('delete');
		if (del) del.innerText = "";
	};
</script>
