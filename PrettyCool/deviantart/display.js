/*globals followed,mutuals,watchers, YOU, addStuff*/

function getHttp(name) {
	return "http://" + name + ".deviantart.com/gallery/?catpath=/";
}

function putOn(lis) {
	var div = document.createElement("div"), img, a, i, item;
	div.classList.add('boundy');
	
	for (item = lis[i = 0]; i < lis.length; item = lis[i += 1]) {
		a = document.createElement("a");
		a.classList.add('dALink');
		
		a.href = getHttp(item.name);

		img = document.createElement("img");
		img.src = item.src;

		addStuff(div, a, img, item.name);
	}
	return div;
}

function run() {
	var fileref=document.createElement('script');
	fileref.setAttribute("type","text/javascript");
	fileref.setAttribute("src", "current/"+window.location.hash.substr(1)+".js");
	
	fileref.onload = function() {
		var temp;
		document.querySelector('link[rel="icon"]').href = YOU.src;

		temp = putOn(followed);
		addTo.appendChild(temp);
		temp.insertBefore(document.createElement("h2"), temp.children[0]).textContent = "People " + YOU.name + " Watches: " + followed.length;

		temp = putOn(mutuals);
		addTo.appendChild(temp);
		temp.insertBefore(document.createElement("h2"), temp.children[0]).textContent = "People With Mutual Watchage: " + mutuals.length;

		temp = putOn(watchers);
		addTo.appendChild(temp);
		temp.insertBefore(document.createElement("h2"), temp.children[0]).textContent = "People Who Watch " + YOU.name + ": " + watchers.length;
	}
	
	document.head.appendChild(fileref);
}

var addTo;
window.onload = function() {
	addTo = document.getElementById('main');
	if (!addTo) addTo = document.body;
	addTo.innerHTML = "";
	if (window.location.hash.substr(1)!="") {
		run();
	} else {
		for (var i=0; i<mains.length; i++) {
			var a = document.createElement("a");
			a.setAttribute('onclick','callPage("'+mains[i]+'")');
			addTo.appendChild(a).innerHTML = mains[i]+"<br>";
			a.href = "#"+mains[i];
		}
		
	}
}
window.onpopstate = window.onload;

function AjaxCaller(){
    var xmlhttp=false;
    try{
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    }catch(e){
        try{
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }catch(E){
            xmlhttp = false;
        }
    }

    if(!xmlhttp && typeof XMLHttpRequest!='undefined'){
        xmlhttp = new XMLHttpRequest();
    }
    return xmlhttp;
}

function callPage(n){
	console.log(n);
    ajax=AjaxCaller();
    ajax.open("GET", 'main.php?name='+n, true);
    ajax.send();
}