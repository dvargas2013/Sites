function doit(ss) {
	for (var si=0; si<ss.length; si++) {
		aa=document.getElementsByTagName(ss[si]); 
		for (var ai=0; ai<aa.length; ai++) {
			item=aa[ai];
			item.style.fontFamily='daedra';
		}
	}
}
doit(['a','abbr','address','article','b','blockquote','body','caption','cite','code','datalist','dd','details','dialog','div','dl','dt','em','figcaption','footer','form','h1','h2','h3','h4','h5','h6','head','header','html','i','input','ins','label','legend','li','ol','output','p','param','q','s','samp','select','small','span','strong','sub','summary','sup','table','tbody','td','textarea','tfoot','th','thead','time','title','tr','track','u','ul']);