<?php
function goodFileType($file) {
	return strpos($file, '.') !== false  && strpos($file, 'index') === false;
}

function Embeder($path) {
    //using the opendir function
    $dir_handle = @opendir($path) or die("Unable to open $path");
    
    while (false !== ($file = readdir($dir_handle))) {
        if($file!="." && $file!="..") {
			if (!is_dir($path."/".$file) && goodFileType($file)) {
               echo "<div style='display:inline-block;padding: 5px;'><a href=".$file."><embed style='max-height:350px;max-height:350px' src=".$file."></embed></a></div>";
            } 
        }
    }
    
    //closing the directory
    closedir($dir_handle);
}
Embeder('.');
?>