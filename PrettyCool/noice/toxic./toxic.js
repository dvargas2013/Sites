var BOARD, TILE, PERSON;
/*board is a structure for tiles and tiles contain toxicity and people*/

var HELPER = {};
HELPER.getTox = function(a){ return a.toxicity; }

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
	this.maxTox = 0;
	this.minTox = Infinity;
	for (var x of this.matrix) {
		var toxmap = x.map(HELPER.getTox);
		this.maxTox = Math.max(this.maxTox,...toxmap);
		this.minTox = Math.min(this.minTox,...toxmap);
	}
	this.toxSlope = 255 / (this.maxTox-this.minTox);
	this.toxIntercept = -this.toxSlope*this.minTox;
}
TILE = function(b, x, y, t) {
	this.board = b;
	this.x = x;
	this.y = y;
	this.toxicity = t || 0;
	this.board.people.push(new PERSON(b));
};
TILE.SIZE = 50;
TILE.prototype.color = function() {
	// c = 0 corresponds to mintox and c=255 corresponds to maxtox
	var c = 255-Math.floor(this.board.toxSlope*this.toxicity + this.board.toxIntercept);
	c = Math.floor(c).toString(16);
	if (c.length == 1) c = "0" + c;
	return c;
};
TILE.prototype.draw = function() {
	ctx.fillStyle = "#000";
	ctx.fillRect(this.x * TILE.SIZE, this.y * TILE.SIZE, TILE.SIZE, TILE.SIZE);
	var c = this.color();
	ctx.fillStyle = ("#" + c + "ff" + c);
	ctx.fillRect(this.x * TILE.SIZE + 1, this.y * TILE.SIZE + 1, TILE.SIZE - 2, TILE.SIZE - 2);
};
TILE.prototype.update = function() {
	this.toxicity -= .1;
	if (this.toxicity < 0) this.toxicity = 0;
};
TILE.prototype.neighbors = function* (){
	for (var x=-1; x<2; x++) {
		for (var y=-1; y<2; y++) {
			if (x == 0 && y == 0) continue;
			var X = this.x + x, Y = this.y + y;
			if (X < 0 || Y < 0 || Y >= this.board.my || X >= this.board.mx) continue;
			yield this.board.matrix[X][Y];
		}
	}
};
PERSON = function(B,t,x,y) {
	this.board = B;
	this.toxicity = t || .5 + Math.random();
	this.x = x || Math.random()*B.mbx;
	this.y = y || Math.random()*B.mby;
	if (this.x < 0) this.x += TILE.SIZE;
	if (this.y < 0) this.y += TILE.SIZE;
}; // TODO PEOPLE can be born and die
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

	if (this.x < 0) this.x = 0;
	if (this.y < 0) this.y = 0;
	if (this.x > this.board.mbx) this.x = this.board.mbx-1;
	if (this.y > this.board.mby) this.y = this.board.mby-1;
	var t = this.findTile();
	t.toxicity += this.toxicity;
	
	var ts = Array.from(t.neighbors()), m = Math.min(...(ts.map(HELPER.getTox)));
	var T;
	for (T of ts) {
		if (T.toxicity === m) break;
	}
	this.x += (T.x-t.x)*TILE.SIZE;
	this.y += (T.y-t.y)*TILE.SIZE;
	// TODO make the move smoother
}

var framer, canvas, ctx, frames, mainboard, pause = false, info;

var INFO = function(b) {
	this.board = b;
	this.x = 0;
	this.y = 0;
}
INFO.prototype.set = function(x,y) {
	if (x == y && x === undefined)
		return this.x != 0 && this.y != 0;
	else {
		this.x = (x<this.board.mbx)?x:0;
		this.y = (y<this.board.mby)?y:0;
	}
}
INFO.prototype.draw = function() {
	ctx.fillStyle = '#F0F';
	ctx.fillRect(this.x,this.y,100,100);
	// TODO info about the tile
}

window.onresize = function () {
	frames = 0;
	canvas.height = framer.clientHeight;
	canvas.width = framer.clientWidth;
	mainboard = new BOARD(canvas.width / TILE.SIZE - 1, canvas.height / TILE.SIZE - 1);
	info = new INFO(mainboard);
};

var init = function () {
	framer=document.body;
	canvas = document.createElement("canvas");
	ctx = canvas.getContext("2d");
	if (document.getElementById('main')) framer=document.getElementById('main');
	framer.appendChild(canvas);
	window.onresize();
	
	canvas.onmousemove = function(e) {
		info.set(e.offsetX,e.offsetY);
	}
	canvas.onmouseleave = function() {
		info.set(0,0);
	}
	
	document.body.onkeypress = function() { pause = !pause; }
	
	loop();
};

var loop = function () {
	if (!pause) {
		frames++;
		if (frames % 5 == 0) {
			mainboard.update();
			frames = 0;
		}
	}
	
	ctx.fillStyle = '#FFF';
	ctx.fillRect(0,0,canvas.width,canvas.height);
	mainboard.draw();
	
	if (info.set()) info.draw();
	
	window.requestAnimationFrame(loop, canvas);
};

window.onload = init;