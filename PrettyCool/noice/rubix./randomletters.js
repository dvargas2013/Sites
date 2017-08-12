var matr={' ':[116,47,35,26,20,38,20,72,63,6,6,27,43,24,63,25,2,17,78,167,15,6,67,1,16,1],
'A':[1,32,39,15,1,10,18,1,16,1,10,77,18,172,2,31,1,101,67,124,12,24,7,1,27,1],
'B':[8,0,0,0,58,0,0,0,6,2,0,21,1,0,1,0,0,6,5,0,5,0,0,0,19,0],
'C':[44,0,12,0,55,1,0,46,15,0,8,16,0,0,59,1,0,7,1,38,16,0,1,0,0,0],
'D':[45,18,4,10,39,12,2,3,57,1,0,7,9,5,37,7,1,10,32,39,8,4,9,0,6,0],
'E':[131,11,64,107,39,23,20,15,40,1,2,46,43,120,46,32,14,154,145,80,7,16,41,17,17,0],
'F':[21,2,9,1,25,14,1,6,21,1,0,10,3,2,38,3,0,4,8,42,11,1,4,0,1,0],
'G':[11,2,1,1,32,3,1,16,10,0,0,4,1,3,23,1,0,21,7,13,8,0,2,0,1,0],
'H':[84,1,2,1,251,2,0,5,72,0,0,3,1,2,46,1,0,8,3,22,2,0,7,0,1,0],
'I':[18,7,55,16,37,27,10,0,0,0,8,39,32,169,63,3,0,21,106,88,0,14,1,1,0,4],
'J':[1,0,0,0,2,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,4,0,0,0,0,0],
'K':[0,0,0,0,28,0,0,0,8,0,0,0,0,3,3,0,0,0,2,1,0,0,3,0,3,0],
'L':[34,7,8,28,72,5,1,0,57,1,3,55,4,1,28,2,2,2,12,19,8,2,5,0,47,0],
'M':[56,9,1,2,48,0,0,1,26,0,0,0,5,3,28,16,0,0,6,6,13,0,2,0,3,0],
'N':[54,7,31,118,64,8,75,9,37,3,3,10,7,9,65,7,0,5,51,110,12,4,15,1,14,0],
'O':[9,18,18,16,3,94,3,3,13,0,5,17,44,145,23,29,0,113,37,53,96,13,36,0,4,2],
'P':[21,1,0,0,40,0,0,7,8,0,0,29,0,0,28,26,0,42,3,14,7,0,1,0,2,0],
'Q':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,0,0],
'R':[57,4,14,16,148,6,6,3,77,1,11,12,15,12,54,8,0,18,39,63,6,5,10,0,17,0],
'S':[75,13,21,6,84,13,6,30,42,0,2,6,14,19,71,24,2,6,41,121,30,2,27,0,4,0],
'T':[56,14,6,9,94,5,1,315,128,0,0,12,14,8,111,8,0,30,32,53,22,4,16,0,21,0],
'U':[18,5,17,11,11,1,12,2,5,0,0,28,9,33,2,17,0,49,42,45,0,0,0,1,1,1],
'V':[15,0,0,0,53,0,0,0,19,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0],
'W':[32,0,3,4,30,1,0,48,37,0,0,4,1,10,17,2,0,1,3,6,1,1,2,0,0,0],
'X':[3,0,5,0,1,0,0,0,4,0,0,0,0,0,1,4,0,0,0,1,1,0,0,0,0,0],
'Y':[11,11,10,4,12,3,5,5,18,0,0,6,4,3,28,7,0,5,17,21,1,3,14,0,0,0],
'Z':[1,0,0,0,5,0,0,0,2,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
}
var cumsum = function(a) {
	var last = 0;
    for (var i = 1; i < a.length; i++) {
		if (a[i] === 0) continue;
		a[i] = last+a[i];
		last = a[i];
	}
	a[a.length] = last;
}
for (var i in matr) { cumsum(matr[i]); }
var boop = function (a) {
	var n = Math.random()*a[a.length-1];
	for (var i = 0; i<a.length; i++) {
		if (a[i]>n) return String.fromCharCode(i+65);
	}
	return 'A';
}
CHAIN = function CHAIN(n){
	var word = ' ';
	for (var i = 0; i < n; i++) word+=boop(matr[word[word.length-1]]);
	return word.substring(1);
}