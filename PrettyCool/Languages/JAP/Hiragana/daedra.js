/*global ans*/
var lis = document.getElementsByTagName("td"),
    answer,
    n = 0,
    possibleJ = ["%E3%81%82", "%E3%81%84", "%E3%81%86", "%E3%81%88", "%E3%81%8A", "%E3%81%8B", "%E3%81%8D", "%E3%81%8F", "%E3%81%91", "%E3%81%93", "%E3%81%95", "%E3%81%97", "%E3%81%99", "%E3%81%9B", "%E3%81%9D", "%E3%81%9F", "%E3%81%A1", "%E3%81%A4", "%E3%81%A6", "%E3%81%A8", "%E3%81%AA", "%E3%81%AB", "%E3%81%AC", "%E3%81%AD", "%E3%81%AE", "%E3%81%AF", "%E3%81%B2", "%E3%81%B5", "%E3%81%B8", "%E3%81%BB", "%E3%81%BE", "%E3%81%BF", "%E3%82%80", "%E3%82%81", "%E3%82%82", "%E3%82%84", "%E3%82%86", "%E3%82%88", "%E3%82%89", "%E3%82%8A", "%E3%82%8B", "%E3%82%8C", "%E3%82%8D", "%E3%82%8F", "%E3%82%92", "%E3%82%93"], //possibleJ = ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ', 'ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り', 'る', 'れ', 'ろ', 'わ', 'を', 'ん'],
    possibleR = ["%EF%BD%81", "%EF%BD%89", "%EF%BD%95", "%EF%BD%85", "%EF%BD%8F", "%EF%BD%8B%EF%BD%81", "%EF%BD%8B%EF%BD%89", "%EF%BD%8B%EF%BD%95", "%EF%BD%8B%EF%BD%85", "%EF%BD%8B%EF%BD%8F", "%EF%BD%93%EF%BD%81", "%EF%BD%93%EF%BD%88%EF%BD%89", "%EF%BD%93%EF%BD%95", "%EF%BD%93%EF%BD%85", "%EF%BD%93%EF%BD%8F", "%EF%BD%94%EF%BD%81", "%EF%BD%83%EF%BD%88%EF%BD%89", "%EF%BD%94%EF%BD%93%EF%BD%95", "%EF%BD%94%EF%BD%85", "%EF%BD%94%EF%BD%8F", "%EF%BD%8E%EF%BD%81", "%EF%BD%8E%EF%BD%89", "%EF%BD%8E%EF%BD%95", "%EF%BD%8E%EF%BD%85", "%EF%BD%8E%EF%BD%8F", "%EF%BD%88%EF%BD%81", "%EF%BD%88%EF%BD%89", "%EF%BD%86%EF%BD%95", "%EF%BD%88%EF%BD%85", "%EF%BD%88%EF%BD%8F", "%EF%BD%8D%EF%BD%81", "%EF%BD%8D%EF%BD%89", "%EF%BD%8D%EF%BD%95", "%EF%BD%8D%EF%BD%85", "%EF%BD%8D%EF%BD%8F", "%EF%BD%99%EF%BD%81", "%EF%BD%99%EF%BD%95", "%EF%BD%99%EF%BD%8F", "%EF%BD%92%EF%BD%81", "%EF%BD%92%EF%BD%89", "%EF%BD%92%EF%BD%95", "%EF%BD%92%EF%BD%85", "%EF%BD%92%EF%BD%8F", "%EF%BD%97%EF%BD%81", "%EF%BD%97%EF%BD%8F", "%EF%BD%8E"], //possibleR = ['ａ', 'ｉ', 'ｕ', 'ｅ', 'ｏ', 'ｋａ', 'ｋｉ', 'ｋｕ', 'ｋｅ', 'ｋｏ', 'ｓａ', 'ｓｈｉ', 'ｓｕ', 'ｓｅ', 'ｓｏ', 'ｔａ', 'ｃｈｉ', 'ｔｓｕ', 'ｔｅ', 'ｔｏ', 'ｎａ', 'ｎｉ', 'ｎｕ', 'ｎｅ', 'ｎｏ', 'ｈａ', 'ｈｉ', 'ｆｕ', 'ｈｅ', 'ｈｏ', 'ｍａ', 'ｍｉ', 'ｍｕ', 'ｍｅ', 'ｍｏ', 'ｙａ', 'ｙｕ', 'ｙｏ', 'ｒａ', 'ｒｉ', 'ｒｕ', 'ｒｅ', 'ｒｏ', 'ｗａ', 'ｗｏ', 'ｎ'],
    savedR = [],
    savedJ = [];
for (i = 0; i < possibleJ.length; i += 1) {
    possibleJ[i] = decodeURI(possibleJ[i]);
    possibleR[i] = decodeURI(possibleR[i]);
}

function rand(n) {
    return Math.floor(Math.random() * n);
}

function random() {
    if (possibleJ.length < lis.length) {
        possibleJ = possibleJ.concat(savedJ);
        possibleR = possibleR.concat(savedR);
        savedR = [];
        savedJ = [];
    }
    var i = rand(possibleJ.length);
    savedJ.push(possibleJ.splice(i, 1)[0]);
    savedR.push(possibleR.splice(i, 1)[0]);
    return [savedJ[savedJ.length - 1], savedR[savedR.length - 1]];
}

var tempAns;
function doAction() {
		var item,
				i = 0,
				tempDiv;

		switch (n) {
				case 0:
						for (item = lis[i = 0]; i < lis.length; item = lis[i += 1]) {
								item.classList.remove("answer");
								item.classList.remove("active");
						}
						answer = random();
						document.getElementsByClassName("question")[0].textContent = answer[1 - ans];
						if (tempAns) document.getElementsByClassName("question")[0].scrollIntoView();
				
						tempAns = rand(lis.length);
						for (item = lis[i = 0]; i < lis.length; item = lis[i += 1]) {
								tempDiv = document.createElement('div');
								tempDiv.classList.add('question');

								if (i === tempAns) {
										item.textContent = answer[ans];
										tempDiv.textContent = answer[1 - ans];
										item.classList.toggle("answer");
								} else {
										item.textContent = random()[ans];
										if (ans === 0) {
												tempDiv.textContent = savedR[savedR.length - 1];
										} else {
												tempDiv.textContent = savedJ[savedJ.length - 1];
										}
								}

								item.appendChild(tempDiv);
						}
						n = 1;
						break;
				case 1:
						document.getElementsByClassName("answer")[0].classList.toggle("active");
						n = 2;
						break;
				case 2:
						tempDiv = document.querySelectorAll('td .question');
						for (item = tempDiv[i = 0]; i < tempDiv.length; item = tempDiv[i += 1]) {
								item.classList.add('show');
						}
				    document.getElementsByClassName("answer")[0].scrollIntoView();
						n = 0;
						break;
		}
}


window.onload = function () {
    doAction();
};
document.onkeydown = function (e) {
    if (e.which === 32) {
        e.preventDefault();
        doAction();
    }
};