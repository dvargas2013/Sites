<style>
#autoadds div p { display: inline; }
#autoadds > div { position: relative; }
#autoadds > div:nth-child(odd) { background-color:white; }
#autoadds > div:nth-child(even) { background-color:aliceblue; }
#autoadds div div {
	right: 0px;
    bottom: 0px;
    position: absolute;
}
</style>
<body>
<div id="autoadds"></div>
<script>
parse = function parse(words) {
	if (typeof words === "string") {
		return words;
	} else if (words instanceof Array) {
		return words.join(', ');
	} else if (typeof words === "object") {
		if (words['char']) {
			words = words['char'];
			var s = "";
			for (var i in words)
				s += '<a href="?character=' + i + '">' + words[i] + '</a> ';
			return s;
		} else if (words['colors']) {
			words = words['colors'];
			var s = "";
			for (var i in words)
				s += '<span style="background-color:'+words[i]+'">' + i + '</span> ';
			return s;
		} else {
			var s = "";
			for (var i in words)
				s += i + ': ' + words[i] + '; ';
			return s;
		}
	} else {
		return words;
	} 
};
loader = function loader() {
	for (var i in char)
		autoadds.appendChild(document.createElement('div')).innerHTML 
		= "<p>"+i+':'+'</p><div>'+ parse(char[i]) +"</div>";
};
</script>
<script id='script' src="characters/<?php echo($_GET['character']);?>.js" onload="loader();" onerror="autoadds.innerHTML='Nothing to see here'"></script>
</body>