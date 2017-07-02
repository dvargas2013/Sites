<?php
require "indexgen.php";
function _404_() {
	http_response_code(404); // Needs to add the php header after this NOT BEFORE
	include "header.php";
	echo "404 Error: That file doesn't exist, mate";
	include "footer.php";
}
function checkAndInclude($file) {
	$file = rtrim($file, '/');
	global $debug, $load;
	if ($debug) echo "<br>$file is";
	if (file_exists($file.".html")) {
		if ($debug) echo " html";
		$header_file="head.html";
		require "header.php";
		include $file.".html";
		require "footer.php";
		return True;
	} else if (file_exists($file.".php")) {
		if ($debug) echo " php";
		if ($load) require "header.php";
		include $file.".php";
		if ($load) require "footer.php";
		return True;
	}
	if ($debug) echo " nothing";
	return False;
}
$debug = 0;
if ($debug) {
	echo "GET=";
	var_dump($_GET);
	echo "<br>POST=";
	var_dump($_POST);
	echo "<br>".$_GET['q'];
}

if (empty($_GET["q"])) {
	if ($debug) echo " was empty";
	// Fake root is PrettyCool
	require "header.php";
	chdir("PrettyCool");
	ListFolder(".");
	require "footer.php";
} else {
	if ($debug) echo " was not empty";
	// HTA sends us ?q=[path] if it doesnt exist
	$file = $_GET["q"];
	$load = !($_GET['raw'] || $_POST['raw']);
	
	// if its not there using root. Use PrettyCool as if it were root.
	chdir("PrettyCool");
	if (!file_exists($file)) {
		if ($debug) echo " but didnt exist in PrettyCool";
		// check and include does stuff
		// if it fails then its a 404 error
		if (!checkAndInclude($file)) _404_();
		die;
	}
	
	if (is_dir($file)) {
		if ($debug) echo " and is a directory";
		$path = rtrim($file, '/') . '/';
		if ($path !== $file) {
			header('Location: http://'.$_SERVER['HTTP_HOST'].'/'.$path);
			// SHOULD NOT ADD HEADER BEFORE THIS
			die;
		}
		// Assert : file and path are same now
		chdir($file);
		// If there are no index files then make ur own index
		if (!checkandInclude("index")) {
			require "header.php";
			chdir("..");
			ListFolder(end(explode("/",rtrim($file, '/'))));
			require "footer.php";
		}
	} else {
		if ($debug) echo " and is not a directory";
		chdir(dirname($file));
		$file=basename($file);
		if (goodFileType($file)) {
			if ($load) require "header.php";
			require $file;
			if ($load) require "footer.php";
		} else {
			header('Content-type: '.get_mime($file));
			// For the love of all that is code. Dont add a header before this.
			require $file;
		}
	}
}
?>