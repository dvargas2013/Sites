var lis = document.getElementsByTagName("td"),
    answer,
    n = 0,
    possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    saved = "";

function rand(n) {
    return Math.floor(Math.random() * n);
}

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
		document.getElementsByClassName("active")[0].scrollIntoView();
        n = 0;
        break;
    }
}

window.onload = function () {
    doAction();
};
document.onkeydown = function (e) {
    switch (e.which) {
    case 32:
        e.preventDefault();
        doAction();
        break;
    }
};