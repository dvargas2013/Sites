<?php
@require "header.php";

if (empty($_GET["q"])) {
	
	@require "indexgen.php";
	ListFolder("PrettyCool");

} else {
	// HTA sends us ?q=[path] if it doesnt exist
	$file = $_GET["q"];
	// if its not there using root. Use PrettyCool as if it were root.
	chdir("PrettyCool");
	if (file_exists($file)) {
		if (is_dir($file)) {
			chdir($file);
			if (file_exists("index.html")) {
				@require "index.html";
			} else if (file_exists("index.php")) {
				@require "index.php";
			}
		} else {
			@require $file;
		}
	} else {
		if (file_exists($file.".html")) {
			@require $file.".html";
		} else if (file_exists($file.".php")) {
			@require $file.".php";
		}
	}

}

@require "footer.php";
?>