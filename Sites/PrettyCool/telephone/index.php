<?php
function goodFileType($file) {
	return substr_compare($file, '.html', -5) === 0 or (substr_compare($file, '.php', -4) === 0 and substr_compare($file, 'index.php', -9) !== 0) or substr_compare($file, '.gif', -4) === 0;
	return false;
}

function ListFolder($path) {
    //using the opendir function
    $dir_handle = @opendir($path) or die("Unable to open $path");
    
    //Leave only the lastest folder name
    $dirname = end(explode("/", $path));
    
    //display the target folder.
    //echo "<li><a>$dirname</a>";
    while (false !== ($file = readdir($dir_handle))) {
        if($file!="." && $file!="..") {
			if (is_dir($path."/".$file)) {
				if (strpos($file, '.') == false)
				echo "<ul><a href=".$file.">".$file."/</a></ul>";
			} elseif (goodFileType($file)) {
               echo "<ul><a href=".$file.">".$file."</a></ul>";
            } 
        }
    }
    //echo "</li>";
    
    //closing the directory
    closedir($dir_handle);
}
ListFolder('.');
?>