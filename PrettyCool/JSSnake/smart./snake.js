function randint(l) { return Math.floor(Math.random()*l); }
function choice(array){ return array[Math.floor(Math.random()*array.length)]; }
function xysame(a,b){ return (a.x||0)==(b.x||0) && (a.y||0)==(b.y||0); }
function xyminus(a,b){ return {x:(a.x||0)-(b.x||0),y:(a.y||0)-(b.y||0)}; }
function xyplus(a,b) { return {x:(a.x||0)+(b.x||0),y:(a.y||0)+(b.y||0)}; }
function xymult(a,b) { return {x:(a.x||0)*(b.x||0),y:(a.y||0)*(b.y||0)}; }
// taxi dist
function xydist(a,b){ return Math.abs((a.x||0)-(b.x||0)) + Math.abs((a.y||0)-(b.y||0)); }

var BOARD,SNAKE, blocksize = 20, updatetime = 5;
function draw(ctx,x,y,color){
	ctx.fillStyle = "#000";
	ctx.fillRect(x * blocksize, y * blocksize, blocksize, blocksize);
	ctx.fillStyle = color;
	ctx.fillRect(x * blocksize+1, y * blocksize+1, blocksize-2, blocksize-2);
}
function drawpath(ctx,array,color,cycle){
	var ts2=blocksize/2;
	var s = array[0];
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(s.x*blocksize+ts2,s.y*blocksize+ts2);
	for (var s of array) ctx.lineTo(s.x*blocksize+ts2,s.y*blocksize+ts2);
	if (cycle) ctx.closePath();
	ctx.stroke();
}

SNAKE = function(d,x,y,b) {
	this.direction = d;
	this.queue = [];
	this.board = b;
	this.push(x,y);
}
SNAKE.PAUSE = {};
SNAKE.LEFT = {x:-1};
SNAKE.UP = {y:-1};
SNAKE.RIGHT = {x:1};
SNAKE.DOWN = {y:1};
SNAKE.updatetime = 5;
SNAKE.prototype.push = function (x, y) {
	var X = this.board.matrix[x]
	if (!X || y<0 || y>=X.length) return;
	this.board.matrix[x][y] = 1;
	this.queue.unshift({x:x,y:y});
};
SNAKE.prototype.pop = function () {
	var t = this.queue.pop();
	this.board.matrix[t.x][t.y] = 0;
};
SNAKE.prototype.draw = function (ctx) {
	var s = this.queue[0];
	draw(ctx,s.x,s.y,"#000");
	drawpath(ctx,this.queue,"#000",0);
};
SNAKE.prototype.update= function() {
	var d = this.direction;
	if (d !== SNAKE.PAUSE) {
		var xy = xyplus(this.queue[0],this.direction);
		if (xy.x<0 || xy.y<0 || xy.x>=this.board.mx || xy.y>=this.board.my) {
			this.direction = SNAKE.PAUSE; 
			return;
		}
		
		if (xysame(this.board.food,xy)) {
			this.board.score += 1;
			this.board.randFood();
		} else if (this.board.matrix[xy.x][xy.y]) {
			this.direction = SNAKE.PAUSE;
			return;
		} else {
			this.pop();
		}
		this.push(xy.x,xy.y);
	}
}

function last(array){ return array[array.length-1]; }
function makePathMatrix(mx,my){
	// at least 1 need be even
	var l = [];
	var xy = {x:0,y:0};
	if (my%2==0)      var C="y",M="x",mC=my,mM=mx;
	else if (mx%2==0) var C="x",M="y",mC=mx,mM=my;
	// xy[C] usually constant. slowly increases
	// xy[M] almost always moving. goes up and down
	for (;xy[C]<mC;xy[C]++){
		for (;xy[M]<mM;xy[M]++) l.push({x:xy.x,y:xy.y});
		xy[C]+=1; xy[M]-=1; //l.push({x:xy.x,y:xy.y});
		for (;xy[M]>0;xy[M]--) l.push({x:xy.x,y:xy.y});
		xy[M]+=1;
	}
	xy[C]-=1; xy[M]-=1;
	for (;xy[C]>0;xy[C]--)l.push({x:xy.x,y:xy.y});
	
	// create a matrix with node
	var matrix = [];
	for (var x=0; x<mx; x++) {
		matrix.push([]);
		for (var y=0;y<my; y++){
			matrix[x].push(0);
		}
	}
	
	var p = last(l);
	for (var n of l) {
		// set node into location in matrix
		matrix[n.x][n.y] = n;
		// set the Previous and Next nodes
		n.p = p;
		p.n = n;
		p=n;
	}
	
	return matrix;
}
BOARD = function (mx, my) {
	this.mx = mx || 4;
	this.my = my || 4;
	if (this.mx%2==1 && this.my%2==1){
		// If they're both odd there is no hamiltonian cycle
		if (this.mx>this.my){
			this.mx -= 1;
		} else {
			this.my -= 1;
		}
	}
	this.matrix = [];
	for (var x=0; x<this.mx; x++) {
		this.matrix.push([]);
		for (var y=0;y<this.my; y++){
			this.matrix[x].push(0);
		}
	}
	this.pathmatrix = makePathMatrix(this.mx,this.my);
	this.snake = new SNAKE(SNAKE.PAUSE, randint(this.mx), randint(this.my), this);
	this.randFood();
	this.score = 0;
};
BOARD.prototype.randFood=function(){
	var ES = [];
	for (var x=0; x<this.mx; x++) {
		for (var y=0;y<this.my; y++){
			var e = {x:x,y:y};
			if (this.matrix[x][y] == 0 && (!this.food || !xysame(this.food,e)))
				ES.push(e);
		}
	}
	this.food = choice(ES);
}
BOARD.prototype.draw=function(ctx){
	for (var x = 0; x < this.mx; x++) {
		for (var y = 0; y < this.my; y++) {
			if (this.matrix[x][y]) draw(ctx,x,y,"#0ff");
			else draw(ctx,x,y,"#fff");
		}
	}
	
	var ts2=blocksize/2;
	// Draw the Path
	for (var x = 0; x < this.mx; x++) {
		for (var y = 0; y < this.my; y++) {
			var s = this.pathmatrix[x][y];
			ctx.strokeStyle = "#bbb";
			ctx.beginPath();
			ctx.moveTo(s.x*blocksize+ts2,s.y*blocksize+ts2);
			ctx.lineTo(s.n.x*blocksize+ts2,s.n.y*blocksize+ts2);
			ctx.stroke();
		}
	}
	
	draw(ctx,this.food.x,this.food.y,"#f00");
	this.snake.draw(ctx);
}
BOARD.prototype.update=function(){
	this.snake.update();
}

var frames, canvas, ctx, mainboard, state=[0,0,0,0], stateAdd=0, stateRem=0, paused=false, snakedir=[SNAKE.LEFT,SNAKE.UP,SNAKE.RIGHT,SNAKE.DOWN];
window.onresize = function () {
	frames = 0;
	canvas.height = framer.clientHeight;
	canvas.width = framer.clientWidth;
	mainboard = new BOARD(Math.floor(canvas.width / blocksize) - 1, Math.floor(canvas.height / blocksize) - 1);
};
var init = function () {
	framer=document.body;
	canvas = document.createElement("canvas");
	canvas.onmousedown = function(e) { p1 = clickToXY(e); }
	canvas.onmouseup = function(e) {
		p2 = clickToXY(e);
		if (p1) rot(mainboard,p1,p2);
		p1 = false;
	}
	
	ctx = canvas.getContext("2d");
	if (document.getElementById('main')) framer=document.getElementById('main');
	framer.appendChild(canvas);
	document.addEventListener("keydown", function (evt) {
		if (forceai>0) return ai=1;
		var l = evt.keyCode - 37;
		if (l<0 || l>3) {
			ai = 1;
			return;
		}
		var d = snakedir[l];
		for (var s of state) { if (s == d) return; }  // dont add if its already in the queue
		state[stateAdd] = d;
		stateAdd = (stateAdd+1)%4;
		evt.preventDefault();
		ai = 0;
	});
	window.onresize();
	loop();
	setInterval(AI,updatetime*10)
};
var loop = function () {
	frames++;
	if (frames % updatetime === 0) {
		if (state[stateRem]) {
			mainboard.snake.direction = state[stateRem];
			state[stateRem] = false;
			stateRem = (stateRem+1)%4;
		}
		mainboard.update();
		if (paused) mainboard.snake.direction = SNAKE.PAUSE;
		frames = 0;
	}
	mainboard.draw(ctx);
	window.requestAnimationFrame(loop, canvas);
};

// onmousedown and onmouseup
var p1;
function clickToXY(e){ return {x:Math.floor((e.pageX-canvas.offsetLeft)/blocksize),y:Math.floor((e.pageY-canvas.offsetTop)/blocksize)}; }

var cycle8 = [{x:1,y:1},{x:-1,y:-1},{x:1,y:0},{x:0,y:1},{x:1,y:-1},{x:-1,y:1},{x:-1,y:0},{x:0,y:-1}];
function check(n1,n2) { return (diag(n1.n,n2.n)?{n:"n",p:"p"}:0) || (diag(n1.p,n2.p)?{n:"p",p:"n"}:0); }
function getNP(board,xy){ var X = board.pathmatrix[xy.x]; return X?X[xy.y]:undefined; }
function diag(d1,d2) {
	return xydist(d1,d2) === 2 && d1.x!==d2.x && d1.y!==d2.y;
}
function rot(board,n1,n2) {
	if (!n1 || !n2 || !diag(n1,n2)) return false;
	n1 = getNP(board,n1);;
	n2 = getNP(board,n2);
	// find the matching diagonals
	var d1=n1.n,d2=n2.n,n='n',p='p';
	if (!diag(d1,d2))
		var d1=n1.p,d2=n2.p,n='p',p='n';
	if (!diag(d1,d2)) return false;
	// assert n1[n] === d1 && n2[n] === d2;
	n1[n]=d2; n2[n]=d1; // flip assertion
	// assert d1[p] === n1 && d1[p] === n2;
	d1[p]=n2; d2[p]=n1; // flip assertion

	// There are now 2 cycles
	// Things in the same cycle will be marked with same number
	cycle = [];
	for (var x=0; x<board.mx; x++) {
		cycle.push([]);
		for (var y=0;y<board.my; y++){
			cycle[x].push(0);
		}
	}
	var s = n1;
	do {
		cycle[s.x][s.y] = 1;
		s = s.n;
	} while (s !== n1);
	// TODO Using the original rot and the cycle table
	// find 2x2 sections that match one of the following [[00][11]] [[10][10]] [[01][01]] [[11][00]] 
	// basically leave the conditions but change q (or change n1q,n2q directly)
	// This is good but not perfect
	// It is better to start in that area and traverse the boundary looking for the pattern match
	// clockwise = (-y,x)
	// counter = (y,-x)
	var m = xyminus(n2,n1);
	// for the 8 directions
	// TODO figure out a way to traverse a boundary
	// youre given a binary heat mat
	// and a initial 4x4 with half in half out
	// you need to return the closest 4x4 with halfin halfout condition met
	for (var q of cycle8){
		q = xymult(q,m);
		// get new diagonals
		var n1q = getNP(board,xyplus(q,n1)),
			n2q = getNP(board,xyplus(q,n2));
		// make sure it's in bounds
		if (!(n1q&&n2q)) continue;
		// should be 2 for each cycle
		if (cycle[n1q.x][n1q.y] + cycle[n2q.x][n2q.y] + cycle[n1q.x][n2q.y] + cycle[n2q.x][n1q.y] !== 2) continue;
		var np = check(n1q,n2q);
		// checks that diagonals lead to each other
		if (!np) continue;
		var d1q = n1q[np.n], d2q = n2q[np.n];
		
		n1q[np.n]=d2q; n2q[np.n]=d1q;
		d1q[np.p]=n2q; d2q[np.p]=n1q;

		return true;
	}
	
	// reverse the original rot if failed
	n1[n]=d1; n2[n]=d2;
	d1[p]=n1; d2[p]=n2;
}

// TODO use rot to make shorter paths to food

var AI, ai = 0, forceai = 0;
// negative force deactivates ai
// positive force keeps it on forever
// 0 is neutral - arrow clicks turn off - other keys turn on
AI = function () {
	if (forceai<0) ai = 0;
	if (!ai) return;
	h = mainboard.snake.queue[0];
	var n = mainboard.pathmatrix[h.x][h.y].n;
	var m = xyminus(n,h);
	for (var e of snakedir){
		if (xysame(e,m)) {
			mainboard.snake.direction = e;
			break;
		}
	}
};

window.onload = init;