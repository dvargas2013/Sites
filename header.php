<?date_default_timezone_set(UTC)?>
<head>
<meta charset=“utf-8”>
<link rel="stylesheet" type="text/css" href="/theme.css">
<?if (!empty($header_data)) echo $header_data;
if (!empty($header_file) && file_exists($header_file)) include $header_file;?>
</head>
<body <? if ($_COOKIE["bodyBackgroundColor"]) echo "style=\"background-color:".$_COOKIE['bodyBackgroundColor']."\""; ?> >
<H1 style='background-color: <?php echo "hsl(".$c=rand(0,360).",50%,75%)"?>;' ><a href="/">Home</a>
<?php
$sect=explode("/",trim($_SERVER['REQUEST_URI'],"/"));
array_pop($sect);
$url="/";
foreach ($sect as $index => $string) {
	$string=trim($string);
	if (!empty($string)){
		$url=$url.$string.'/';
		echo "> <a href='$url'>$string</a> " ;
	}
}
?>
<input id="svgColorPicker" style="display:none"type="color"
oninput="document.body.style='background:'+this.value; saveBodyBackground(this.value)"></input>
<svg preserveAspectRatio="xMidYMid meet" style="width: 1em;height: 1em;float: right;padding: .5em;cursor: pointer;" viewBox="0 0 25 25"
onclick="this.previousElementSibling.click()">
<!-- I stole this from YouTube pls no sue me D: -->
<g><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></g></svg>
<script>
function saveBodyBackground(color) {
	document.cookie = "bodyBackgroundColor="+color;
	// we use cookies when we want the server to know
	// localStorage.bodyBackgroundColor = color;
	// we use local storage when thte server doesnt need to noe ur data lol
}
</script>
</H1>
<?php
if (!empty($description_data)) {
	echo "<div id='description'>";
	echo $description_data;
	echo "</div>";
}
else if (!empty($description_file) && file_exists($description_file)) {
	echo "<div id='description'>";
	include $description_file;
	echo "</div>";
}
else if (!empty("desc.htm") && file_exists("desc.htm")) {
	echo "<div id='description'>";
	include "desc.htm";
	echo "</div>";
}
?>
<div id="main">