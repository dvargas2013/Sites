/*globals document, window, setInterval*/
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
SNAKE.updatetime = 1;
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
BOARD.prototype.dtfood = function () {
	return this.snake.distTo(this.food);
};
BOARD.prototype.dttail = function () {
	return this.snake.distTo(this.snake.tail());
};

BOARD.prototype.space = function (st) { // To head
	var grid = [];
	for (var x = 0; x < this.mx; x++) {
		grid.push([]);
		for (var y = 0; y < this.my; y++) {
			grid[x].push({
				x: x,
				y: y,
				g: 0,
				h: 0,
			});
		}
	}
	var start = grid[st.x][st.y];

	var cols = [0, 1, 0, -1],
		rows = [-1, 0, 1, 0];
	// Not the same as the original directions but shh

	var openlist = [start];
	var closedlist = [];
	var currentNode;

	var match = function (neighb) { // not any match
			return neighb.x === neighbor.x && neighb.y === neighbor.y;
		},
		nullifier = function (i) {
			var line = me.matrix[currentNode.x + cols[i]];
			if (line === undefined) return false;
			var t = line[currentNode.y + rows[i]];
			if (t === undefined) return false;
			return t.kind <= 0;
		},
		nodefill = function (i) {
			return grid[currentNode.x + cols[i]][currentNode.y + rows[i]];
		};

	while (openlist.length > 0) {
		var l = 0;
		for (var i = 0; i < openlist.length; i++) {
			if (openlist[i].g+openlist[i].h < openlist[l].g+openlist[l].h) { // lowest estimated left
				l = i;
			}
		}
		currentNode = openlist.splice(l, 1)[0];

		currentNode.h = currentNode.h || this.snake.distTo(currentNode);
		if (currentNode.h < 2) { // DONE?
			if (st === this.food) {
				if (this.space(this.snake.tail())) return currentNode;
			} else if (st === this.snake.tail()) {
				if (currentNode.g > 0) return currentNode;
			} else 
				return currentNode;
		}
		var me = this;
		closedlist.push(currentNode);
		var neighbors = [0, 1, 2, 3].filter(nullifier).map(nodefill);

		for (i = 0; i < neighbors.length; i++) {
			var neighbor = neighbors[i];
			if (closedlist.some(match)) continue;

			var g = currentNode.g + 1;
			var gb = false;

			if (!openlist.some(match)) { // First time seeing the node
				gb = true;
				neighbor.h = this.snake.distTo(neighbor);
				openlist.push(neighbor);
			} else if (g < neighbor.g) {
				// Visited and now it's better
				gb = true;
			}

			if (gb)
				neighbor.g = g;
		}
	}
	
	return false;
};
BOARD.prototype.foodmagic = function() {
	var queue = new BinaryHeap(this.score);
	var a=new Date();
	
	var s = new STATE(this);
	s.moves = s.coolmoves();
	for (var j = 0; j < s.moves.length; j++) {
		var i = s.moves[j];
		if (s.clones[i].space(s.clones[i].snake.tail()))
			queue.push(s.clones[i], 0, i, j+1);
	}
	
	while (queue.content.length > 0) {
		var deep = queue.pop();
		if (deep.h === 0) return deep.head;
		if (new Date() - a > 10) return false;
		
		deep.state.moves = deep.state.coolmoves();
		for (var j = 0; j < deep.state.moves.length; j++) {
			var i = deep.state.moves[j];
			if (deep.state.clones[i].space(deep.state.clones[i].snake.tail()))
				queue.push(deep.state.clones[i], deep.g, deep.head,j+1);
		}
	}
	return false;
}

function BinaryHeap(score){
  this.content = [];
  this.scoreFunction = function(elem){
	  return elem.g+elem.h;
  };
  this.score = score;
}

BinaryHeap.prototype = {
  push: function(element,g,head,i) {
    // Add the new element to the end of the array.
    this.content.push({state:new STATE(element), g:g+1, h:(element.score > this.score)?0:element.dtfood()*i, head:head});
    // Allow it to bubble up.
    this.bubbleUp(this.content.length - 1);
  },

  pop: function() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.splice(this.content.length-1,1)[0];
    // If there are any elements left, put the end element at the
    // start, and let it sink down.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  },

  bubbleUp: function(n) {
    // Fetch the element that has to be moved.
    var element = this.content[n], score = this.scoreFunction(element);
    // When at 0, an element can not go up any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      var parentN = Math.floor((n + 1) / 2) - 1,
      parent = this.content[parentN];
      // If the parent has a lesser score, things are in order and we
      // are done.
      if (score >= this.scoreFunction(parent))
        break;

      // Otherwise, swap the parent with the current element and
      // continue.
      this.content[parentN] = element;
      this.content[n] = parent;
      n = parentN;
    }
  },

  sinkDown: function(n) {
    // Look up the target element and its score.
    var length = this.content.length,
    element = this.content[n],
    elemScore = this.scoreFunction(element);

    while(true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) * 2, child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      var swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N],
        child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore)
          swap = child1N;
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N],
        child2Score = this.scoreFunction(child2);
        if (child2Score < (swap == null ? elemScore : child1Score))
          swap = child2N;
      }

      // No need to swap further, we are done.
      if (swap == null) break;

      // Otherwise, swap and continue.
      this.content[n] = this.content[swap];
      this.content[swap] = element;
      n = swap;
    }
  }
};

var framer, canvas, ctx, state = {},
	frames, init, loop, mainboard;

window.onresize = function () {
	frames = 0;
	canvas.height = framer.clientHeight;
	canvas.width = framer.clientWidth;
	mainboard = new BOARD(Math.floor(canvas.width / TILE.SIZE) - 1, Math.floor(canvas.height / TILE.SIZE) - 1);
};

init = function () {
	framer=document.body;
	canvas = document.createElement("canvas");
	ctx = canvas.getContext("2d");
	if (document.getElementById('main')) framer=document.getElementById('main');
	framer.appendChild(canvas);
	window.onresize();
	loop();
};
paused=false;
loop = function () {
	frames++;
	if (frames % SNAKE.updatetime === 0) {
		if (!paused) mainboard.updatesnake();
		frames = 0;
	}
	mainboard.draw(ctx);
	window.requestAnimationFrame(loop, canvas);
};

window.onload = init;

var STATE, AI;
/*
	state, move - copy board from state and make move
	state - state is actually just a board
*/
STATE = function (board) {
	this.board = board.clone();
	
	var me = this;
	try {
	this.clones = [0, 1, 2, 3].map(function (i) {
		var b = me.board.clone();
		b.snake.direction = i;
		b.updatesnake();
		return b;
	});
	} catch (e) { this.stop = true; return; }
	this.moves = [0, 1, 2, 3].filter(function (i) {
		// no illegal moves.
		return me.clones[i].snake.direction !== SNAKE.PAUSE;
	});
};
STATE.prototype.coolmoves = function() {
	var me = this;

	var aim = me.board.space(me.board.food);
	var states = [0,1,2,3].map(function(i){
		return new STATE(me.clones[i])
	});
	var moves = [0,1,2,3].map(function(i){
		return states[i].moves.length;
	});
	var mindtfood = [0,1,2,3].map(function(i){
		var mm = states[i].clones[0].dtfood();
		for (var j=1;j<states[i].clones.length;j++) {
			var m = states[i].clones[j].dtfood();
			if (m < mm) mm = m;
		}
		return mm;
	});
	var maxdttail = [0,1,2,3].map(function(i){
		var mm = states[i].board.dttail()
		for (var j=0;j<states[i].clones.length;j++) {
			var m = states[i].clones[j].dttail();
			if (m > mm) mm = m;
		}
		return mm;
	});
	var tailg = [0,1,2,3].map(function(i){
		return me.clones[i].space(me.clones[i].snake.tail()).g;
	});
	var oldmove = me.board.snake.direction;

	return me.moves.filter(function(i){ // correct tail moves
		return !!tailg[i];
	}).sort(function(){
		return Math.random()-.5;
	}).sort(function(a,b){ // move old to first pos & random
		if (oldmove === a) return -1;
		if (oldmove === b) return 1;
		return 0;
	// TODO sometimes gets stuck trying to follow tail when it could take alternate path and still return to tail
	}).sort(function(a,b){ // amount of moves
		return moves[a] - moves[b];
	}).sort(function(a,b){ // min farthest from tail
		return - maxdttail[a] + maxdttail[b];
	}).sort(function(a,b){ // Shortest path to food
		return me.clones[a].snake.distTo(aim) - me.clones[b].snake.distTo(aim);
	}).sort(function (a, b) { // highest of scores
		return -me.clones[a].score + me.clones[b].score
	});
}

AI = function () {
 	var s = new STATE(mainboard.clone());
	if (s.stop) return;
	if (s.moves.length === 1) {
		mainboard.snake.direction = s.moves[0];
	} else if (s.moves.length > 1) {
		var aim = false;//mainboard.foodmagic();

		if (aim) {
			mainboard.snake.direction = aim;
		} else {
			mainboard.snake.direction = s.coolmoves()[0];
		}
	}
};

setInterval(AI, SNAKE.updatetime*10);