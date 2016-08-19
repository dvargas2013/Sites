<div id="Characters">Characters:
    <?php
        $dir = @opendir('characters');

        while (false !== ($file = readdir($dir))) {
            if($file!="." && $file!=".." && !is_dir("characters/".$file) && substr_compare($file, '.js', -3) === 0) {
                $filename = substr($file,0,-3);
                echo "<ul><a href=?character=".$filename.">".$filename."</a></ul>";
            }
        }

        closedir($dir);
    ?>
</div>