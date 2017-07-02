<?date_default_timezone_set(UTC)?>
<head>
<meta charset=“utf-8”>
<link rel="stylesheet" type="text/css" href="/theme.css">
<?if (!empty($header_data)) echo $header_data;
if (!empty($header_file) && file_exists($header_file)) include $header_file;?>
</head>
<body>
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
</H1>
<div id="main">