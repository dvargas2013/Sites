var BOARD, TILE, PERSON;
/*board is a structure for tiles and tiles contain toxicity and people*/

BOARD = function (mx, my) {
	this.mx = Math.floor(Math.max(2,mx || 1));
	this.my = Math.floor(Math.max(2,my || 1));
	this.mbx = this.mx * TILE.SIZE;
	this.mby = this.my * TILE.SIZE;
	this.matrix = [];
	this.people = [];
	for (var x = 0; x < this.mx; x++) {
		this.matrix.push([]);
		for (var y = 0; y < this.my; y++) {
			this.matrix[x].push(new TILE(this, x, y));
		}
	}
};
BOARD.prototype.draw = function() {
	for (var x of this.matrix) {
		for (var xy of x) {
			xy.draw();
		}
	}
	for (person of this.people) person.draw();
};
BOARD.prototype.update = function() {
	for (var x of this.matrix) {
		for (var xy of x) {
			xy.update();
		}
	}
	for (person of this.people) person.update();
}
TILE = function(b, x, y, t) {
	this.parentBoard = b;
	this.x = x;
	this.y = y;
	this.toxicity = t || 0;
	this.parentBoard.people.push(new PERSON(b));
};
TILE.SIZE = 50;
TILE.prototype.draw = function() {
	ctx.fillStyle = "#000";
	ctx.fillRect(this.x * TILE.SIZE, this.y * TILE.SIZE, TILE.SIZE, TILE.SIZE);
	var c = (255-this.toxicity);
	if (c < 0) c = "00";
	else c = Math.floor(c).toString(16);
	if (c.length == 1) c = "0" + c;
	ctx.fillStyle = ("#" + c + "ff" + c);
	ctx.fillRect(this.x * TILE.SIZE + 1, this.y * TILE.SIZE + 1, TILE.SIZE - 2, TILE.SIZE - 2);
};
TILE.prototype.update = function() {
	this.toxicity -= .1;
	if (this.toxicity < 0) this.toxicity = 0;
};
PERSON = function(B,t,x,y) {
	this.board = B;
	this.toxicity = t || 1;
	this.x = x || Math.random()*B.mbx;
	this.y = y || Math.random()*B.mby;
	if (this.x < 0) this.x += TILE.SIZE;
	if (this.y < 0) this.y += TILE.SIZE;
};
PERSON.prototype.findTile = function() {
	return this.board.matrix[Math.floor(this.x/TILE.SIZE)][Math.floor(this.y/TILE.SIZE)];
}
PERSON.prototype.draw = function() {
	ctx.beginPath();
	ctx.arc(this.x, this.y, (this.toxicity < 1)?1:this.toxicity*2, 0, 2 * Math.PI);
	ctx.fillStyle = '#F00';
	ctx.fill();
}
PERSON.prototype.update = function() {
	var r = 5*Math.random();
	var d = 2*Math.random()*Math.PI;
	this.x += r*Math.sin(d);
	this.y += r*Math.cos(d);
	// TODO move towards least toxic
	
	if (this.x < 0) this.x = 0;
	if (this.y < 0) this.y = 0;
	if (this.x > this.board.mbx) this.x = this.board.mbx-1;
	if (this.y > this.board.mby) this.y = this.board.mby-1;
	this.findTile().toxicity += this.toxicity;
}

var framer, canvas, ctx, frames, mainboard;

window.onresize = function () {
	frames = 0;
	canvas.height = framer.clientHeight;
	canvas.width = framer.clientWidth;
	mainboard = new BOARD(canvas.width / TILE.SIZE - 1, canvas.height / TILE.SIZE - 1);
};

var init = function () {
	framer=document.body;
	canvas = document.createElement("canvas");
	ctx = canvas.getContext("2d");
	if (document.getElementById('main')) framer=document.getElementById('main');
	framer.appendChild(canvas);
	window.onresize();
	loop();
};

var loop = function () {
	frames++;
	if (frames % 5 == 0) {
		mainboard.update();
		frames = 0;
	}
	ctx.fillStyle = '#FFF';
	ctx.fillRect(0,0,canvas.width,canvas.height);
	mainboard.draw();
	window.requestAnimationFrame(loop, canvas);
};

window.onload = init;