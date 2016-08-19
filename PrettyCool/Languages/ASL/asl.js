/* global changeClass */ 
var lis = document.getElementsByTagName("td"),
	answer,
	n = 0,
	possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	saved = "";
function magicIndex(st) {
	var i = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(st);
	return [ 87*(i%6)+2,72*Math.floor(i/6) ];
}
function change() {
	var lis = document.getElementsByClassName(changeClass), ar;
	for (var i=0; i<lis.length; i++) {
		if (lis[i].innerHTML.includes('url')) continue;
		ar = magicIndex(lis[i].textContent[0]);
		lis[i].innerHTML = '<div style="background: url(http://i.imgur.com/5SooUgq.png); width: 86px; height: 72px;">'+lis[i].innerText+'</div>'
		lis[i].children[0].style.backgroundPositionX = "-"+ar[0]+"px";
		lis[i].children[0].style.backgroundPositionY = "-"+ar[1]+"px";
		lis[i].children[0].style.fontSize='0px';
	}
}

function rand(n) { return Math.floor(Math.random() * n); }
function random() {
	if (possible.length < lis.length) {
		possible += saved;
		saved = "";
	}
	var i = rand(possible.length),
		a = possible[i];
	possible = possible.slice(0, i) + possible.slice(i + 1);
	saved += a;
	return a;
}

var temp;
function doAction() {
	var item, i = 0;
	switch (n) {
	case 0:
		for (item = lis[i = 0]; i < lis.length; item = lis[i += 1]) {
			item.classList.remove("answer");
			item.classList.remove("active");
		}
		answer = random();
		document.getElementsByClassName("question")[0].textContent = answer;
		if (temp) document.getElementsByClassName("question")[0].scrollIntoView();
			
		temp = rand(lis.length);
		for (item = lis[i = 0]; i < lis.length; item = lis[i += 1]) {
			if (i === temp) {
				item.textContent = answer;
				item.classList.toggle("answer");
			} else {
				item.textContent = random();
			}
		}
		n = 1;
		break;
	case 1:
		document.getElementsByClassName("answer")[0].classList.toggle("active");
		n = 2;
		break;
	case 2:
		for (item = lis[i = 0]; i < lis.length; item = lis[i += 1]) {
			temp = document.createElement('div');
			temp.classList.add('question');
			temp.textContent = item.textContent;
			item.appendChild(temp);
		}
		document.getElementsByClassName("answer")[0].scrollIntoView();
		n = 0;
		break;
	}
	change();
}

window.onload = doAction;
document.onkeydown = function (e) {
	switch (e.which) {
	case 32:
		e.preventDefault();
		doAction();
		break;
	}
};