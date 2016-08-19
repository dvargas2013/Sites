<?php
function ListFolder($path) {
    //using the opendir function
    $dir_handle = @opendir($path) or die("Unable to open $path");
    
    //Leave only the lastest folder name
    $dirname = end(explode("/", $path));
    
    //display the target folder.
    echo "<li><a>$dirname</a><ul>";
    while (false !== ($file = readdir($dir_handle))) {
        if($file!="." && $file!="..") {
            if (is_dir($path."/".$file)) {
                ListFolder($path."/".$file);
            } else {
                echo "<li>$file</li>";
            }
        }
    }
    echo "</ul></li>";
    
    //closing the directory
    closedir($dir_handle);
}
ListFolder('/Users/danv/Sites');
?>