<?php
/*
Has the following properties
	hides index.php but shows all other .php files
	shows all .html files but hides .htm files (also hides .HTML files aka is casesensitive)
	shows sub directories
*/
function endsWith($haystack, $needle) {
	$l = strlen($needle);
	return strlen($haystack)>$l and substr_compare($haystack, $needle, -$l) === 0;
}
function goodFileType($file) {
	return endsWith($file,'.html') or (endsWith($file, '.php') and !endsWith($file, 'index.php'));
}

function ListFolder($path) {
    //using the opendir function
    $dir_handle = @opendir($path) or die("Unable to open $path");
    $dir = $path = rtrim($path, '/').'/';
    if (endsWith($_SERVER['REQUEST_URI'],$path)) $path = '';
    //display the target folder.
    while (false !== ($file = readdir($dir_handle))) {
        if($file[0]!=".") {
			if (is_dir($dir.$file)) {
				if (strpos($file, '.') == false)
				echo "<ul><a href=".$path.$file."/>".$file."/</a></ul>";
			} elseif (goodFileType($file)) {
               echo "<ul><a href=".$path.$file.">".$file."</a></ul>";
            } 
        }
    }
    
    //closing the directory
    closedir($dir_handle);
}
function get_mime($file)
{
        $mime_types = array(
            "gif"=>"image/gif"
            ,"png"=>"image/png"
            ,"jpeg"=>"image/jpg"
            ,"jpg"=>"image/jpg"
            ,"mp3"=>"audio/mpeg"
            ,"wav"=>"audio/x-wav"
            ,"mpeg"=>"video/mpeg"
            ,"mpg"=>"video/mpeg"
            ,"mpe"=>"video/mpeg"
            ,"mov"=>"video/quicktime"
            ,"avi"=>"video/x-msvideo"
            ,"3gp"=>"video/3gpp"
            ,"css"=>"text/css"
            ,"jsc"=>"application/javascript"
            ,"js"=>"application/javascript"
            ,"php"=>"text/html"
            ,"htm"=>"text/html"
            ,"html"=>"text/html"
        );
        $extension = strtolower(end(explode('.',$file)));
        return $mime_types[$extension];
}
?>