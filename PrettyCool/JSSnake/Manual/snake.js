/*globals document, window, setInterval*/
	// TODO learn about hamiltonian paths in a grid and about solution rotation to minimize travel
	// or find an algorithm that takes you from 1 end to food and then from food to tail
	// can u just learn how to fken code already
var TILE,
	BOARD,
	SNAKE,
	FOOD;

TILE = function (k, x, y) {
	this.kind = k;
	this.x = x;
	this.y = y;
};
TILE.FOOD = -1;
TILE.NONE = 0;
TILE.SNAKE = 1;
TILE.WALL = 2;
TILE.SIZE = 20;
TILE.prototype.clone = function () {
	return new TILE(this.kind, this.x, this.y);
};
TILE.prototype.setKind = function (k) {
	this.kind = k;
};
TILE.prototype.draw = function (ctx) {
	switch (this.kind) {
		case TILE.FOOD:
			ctx.fillStyle = "#f00";
			ctx.fillRect(this.x * TILE.SIZE, this.y * TILE.SIZE, TILE.SIZE, TILE.SIZE);
			break;
		case TILE.NONE:
			ctx.fillStyle = "#000";
			ctx.fillRect(this.x * TILE.SIZE, this.y * TILE.SIZE, TILE.SIZE, TILE.SIZE);
			ctx.fillStyle = "#fff";
			ctx.fillRect(this.x * TILE.SIZE + 1, this.y * TILE.SIZE + 1, TILE.SIZE - 2, TILE.SIZE - 2);
			break;
		case TILE.SNAKE:
			ctx.fillStyle = "#0ff";
			ctx.fillRect(this.x * TILE.SIZE + 2, this.y * TILE.SIZE + 2, TILE.SIZE - 4, TILE.SIZE - 4);
			break;
		case TILE.WALL:
			ctx.fillStyle = "#000";
			ctx.fillRect(this.x * TILE.SIZE, this.y * TILE.SIZE, TILE.SIZE, TILE.SIZE);
			break;
	}
};

FOOD = function (x, y) {
	this.x = x;
	this.y = y;
};
FOOD.prototype.clone = function () {
	return new FOOD(this.x, this.y);
};
FOOD.prototype.randFood = function (b) {
	var empty = [];
	for (var x = 0; x < b.mx; x++) {
		for (var y = 0; y < b.my; y++) {
			if (b.get(x, y).kind == TILE.NONE) {
				empty.push({
					x: x,
					y: y
				});
			}
		}
	}
	var xy = empty[Math.floor(empty.length * Math.random())];
	this.x = xy.x;
	this.y = xy.y;
	b.get(this.x, this.y).setKind(TILE.FOOD);
};


SNAKE = function (d, x, y) {
	this.direction = d;
	this.queue = [];
	this.push(x, y);
};
SNAKE.PAUSE = -1;
SNAKE.LEFT = 0;
SNAKE.UP = 1;
SNAKE.RIGHT = 2;
SNAKE.DOWN = 3;
SNAKE.dirs = [SNAKE.LEFT,SNAKE.UP,SNAKE.RIGHT,SNAKE.DOWN];
SNAKE.updatetime = 5;
SNAKE.prototype.clone = function () {
	var s = new SNAKE(this.direction);
	s.queue = this.queue.slice();
	return s;
};
SNAKE.prototype.pop = function () {
	return this.queue.pop();
};
SNAKE.prototype.tail = function () {
	return this.queue[this.queue.length - 1];
};
SNAKE.prototype.head = function () {
	return this.queue[0];
};
SNAKE.prototype.push = function (x, y) {
	this.queue.unshift({
		x: x,
		y: y
	});
};
SNAKE.prototype.distTo = function (x, y) {
	if (y === undefined) {
		y = x.y;
		x = x.x;
	}

	var head = this.head();
	return Math.abs(head.x - x) + Math.abs(head.y - y);
};
SNAKE.prototype.distFrom = function (x, y) {
	if (y === undefined) {
		y = x.y;
		x = x.x;
	}

	var tail = this.tail();
	return Math.abs(tail.x - x) + Math.abs(tail.y - y);
};

BOARD = function (mx, my) {
	this.mx = mx || 2;
	this.my = my || 2;
	this.matrix = [];
	for (var x = 0; x < this.mx; x++) {
		this.matrix.push([]);
		for (var y = 0; y < this.my; y++) {
			this.matrix[x].push(new TILE(TILE.NONE, x, y));
		}
	}
	this.food = new FOOD();
	this.food.randFood(this);
	this.set(TILE.SNAKE, this.food.x, this.food.y);
	this.snake = new SNAKE(SNAKE.PAUSE, this.food.x, this.food.y);
	this.food.randFood(this);
	this.score = 0;
};
BOARD.prototype.clone = function () {
	var b = new BOARD();
	b.mx = this.mx;
	b.my = this.my;
	b.matrix = [];
	for (var x = 0; x < b.mx; x++) {
		b.matrix.push([]);
		for (var y = 0; y < b.my; y++) {
			b.matrix[x].push(this.matrix[x][y].clone());
		}
	}
	b.snake = this.snake.clone();
	b.food = this.food.clone();
	b.score = this.score;
	return b;
};
BOARD.prototype.set = function (val, x, y) {
	this.matrix[x][y].setKind(val);
};
BOARD.prototype.get = function (x, y) {
	return this.matrix[x][y];
};
BOARD.prototype.updatesnake = function () {
	if (this.snake.direction !== SNAKE.PAUSE) {
		var head = this.snake.head(),
			nx = head.x,
			ny = head.y;
		switch (this.snake.direction) {
			case SNAKE.LEFT:
				nx--;
				if (nx < 0) {
					this.snake.direction = SNAKE.PAUSE;
					return;
				}
				break;
			case SNAKE.UP:
				ny--;
				if (ny < 0) {
					this.snake.direction = SNAKE.PAUSE;
					return;
				}
				break;
			case SNAKE.RIGHT:
				nx++;
				if (nx >= this.mx) {
					this.snake.direction = SNAKE.PAUSE;
					return;
				}
				break;
			case SNAKE.DOWN:
				ny++;
				if (ny >= this.my) {
					this.snake.direction = SNAKE.PAUSE;
					return;
				}
				break;
		}

		var tail, kind = this.get(nx, ny).kind;
		if (kind === TILE.FOOD) {
			this.score += 1;
			this.food.randFood(this);
		} else if (kind === TILE.SNAKE) {
			this.snake.direction = SNAKE.PAUSE;
			return;
		} else {
			tail = this.snake.pop();
			this.set(TILE.NONE, tail.x, tail.y);
		}
		this.set(TILE.SNAKE, nx, ny);
		this.snake.push(nx, ny);
	}
};
BOARD.prototype.draw = function (ctx) {
	this.get(this.snake.head().x, this.snake.head().y).setKind(TILE.WALL);
	for (var x = 0; x < this.mx; x++) {
		for (var y = 0; y < this.my; y++) {
			this.matrix[x][y].draw(ctx);
		}
	}
	this.get(this.snake.head().x, this.snake.head().y).setKind(TILE.SNAKE);

	var ts2=TILE.SIZE/2
	var s = this.snake.queue[0];
	ctx.beginPath();
	ctx.moveTo(s.x*TILE.SIZE+ts2,s.y*TILE.SIZE+ts2);
	for (var s of this.snake.queue) {
		ctx.lineTo(s.x*TILE.SIZE+ts2,s.y*TILE.SIZE+ts2);
	}
	ctx.stroke();
};
BOARD.prototype.sameas = function (b) {
	if (b.food.x !== this.food.x || b.food.y !== this.food.y) return false;
	if (b.snake.queue.length !== this.snake.queue.length) return false;
	for (var i = 0; i < b.snake.queue.length; i++) {
		if (b.snake.queue[i].x !== this.snake.queue[i].x) return false;
		if (b.snake.queue[i].y !== this.snake.queue[i].y) return false;
	}
	return true;
};

var framer, canvas, ctx, state = [], stateRem=0, stateAdd=0,
	frames, init, loop, mainboard, paused = 0;

window.onresize = function () {
	frames = 0;
	canvas.height = framer.clientHeight;
	canvas.width = framer.clientWidth;
	mainboard = new BOARD(Math.floor(canvas.width / TILE.SIZE) - 1, Math.floor(canvas.height / TILE.SIZE) - 1);
};

var init = function () {
	framer=document.body;
	canvas = document.createElement("canvas");
	ctx = canvas.getContext("2d");
	if (document.getElementById('main')) framer=document.getElementById('main');
	framer.appendChild(canvas);
	document.addEventListener("keydown", function (evt) {
		var l = evt.keyCode - 37;
		if (l<0 || l>3) return;
		var d = SNAKE.dirs[l];
		for (var s of state) { if (s == d) return; }  // dont add if its already in the queue
		state[stateAdd] = d;
		stateAdd = (stateAdd+1)%4;
		evt.preventDefault();
	});
	
	window.onresize();
	loop();
};
var loop = function () {
	frames++;
	if (frames % SNAKE.updatetime === 0) {
		if (state[stateRem] !== undefined) {
			mainboard.snake.direction = state[stateRem];
			state[stateRem] = undefined;
			stateRem = (stateRem+1)%4;
		}
		mainboard.updatesnake();
		if (paused) mainboard.snake.direction = SNAKE.PAUSE;
		frames = 0;
	}
	mainboard.draw(ctx);
	window.requestAnimationFrame(loop, canvas);
};

window.onload = init;