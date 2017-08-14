function randint(l) { return Math.floor(Math.random()*l); }
	
function choice(array){ return array[Math.floor(Math.random()*array.length)]; }
function xysame(a,b){ return (a.x||0)==(b.x||0) && (a.y||0)==(b.y||0); }
function xyminus(a,b){ return {x:(a.x||0)-(b.x||0),y:(a.y||0)-(b.y||0)}; }
function xyplus(a,b) { return {x:(a.x||0)+(b.x||0),y:(a.y||0)+(b.y||0)}; }
function xymult(a,b) { return {x:(a.x||0)*(b.x||0),y:(a.y||0)*(b.y||0)}; }
// taxi dist
function xydist(a,b){ return Math.abs((a.x||0)-(b.x||0)) + Math.abs((a.y||0)-(b.y||0)); }

var BOARD,SNAKE, blocksize = 20, updatetime = 2.5;
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
		
		if (this.board.food && xysame(this.board.food,xy)) {
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

function* xymatrix(mx,my) {
	var xy={};
	for (xy.x=0; xy.x<mx; xy.x++) {
		for (xy.y=0;xy.y<my; xy.y++){
			yield {x:xy.x,y:xy.y};
		}
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
	for (var x=0; x<mx; x++) matrix.push([]);
	for (var xy of xymatrix(mx,my)) matrix[xy.x].push(0);
	
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
var showpath = false;
BOARD = function (mx, my) {
	this.mx = Math.min(20,mx || 4);
	this.my = Math.min(10,my || 4);
	if (this.mx%2==1 && this.my%2==1){
		// If they're both odd there is no hamiltonian cycle
		if (this.mx>this.my){
			this.mx -= 1;
		} else {
			this.my -= 1;
		}
	}
	this.matrix = [];
	for (var x=0; x<this.mx; x++) this.matrix.push([]);
	for (var xy of xymatrix(this.mx,this.my)) this.matrix[xy.x].push(0);
	this.pathmatrix = makePathMatrix(this.mx,this.my);
	this.snake = new SNAKE(SNAKE.PAUSE, randint(this.mx), randint(this.my), this);
	this.randFood();
	this.score = 0;
};
BOARD.prototype.randFood=function(){
	var ES = [];
	for (var xy of xymatrix(this.mx,this.my)){
		if (this.matrix[xy.x][xy.y] == 0 && (!this.food || !xysame(this.food,xy)))
			ES.push(xy);
	}
	this.food = choice(ES);
}
BOARD.prototype.draw=function(ctx){
	for (var xy of xymatrix(this.mx,this.my)) {
		if (this.matrix[xy.x][xy.y]) draw(ctx,xy.x,xy.y,"#0ff");
		else draw(ctx,xy.x,xy.y,"#fff");
	}
	
	// Draw the Path
	if (showpath){
	var ts2=blocksize/2;
	for (var xy of xymatrix(this.mx,this.my)) {
		var s = this.pathmatrix[xy.x][xy.y];
		ctx.strokeStyle = "#bbb";
		ctx.beginPath();
		ctx.moveTo(  s.x*blocksize+ts2,  s.y*blocksize+ts2);
		ctx.lineTo(s.n.x*blocksize+ts2,s.n.y*blocksize+ts2);
		ctx.stroke();
	}}
	
	if (this.food) draw(ctx,this.food.x,this.food.y,"#f00");
	this.snake.draw(ctx);
}
BOARD.prototype.snakeFoodDist=function(){
	if (!this.food) return Infinity;
	var f = this.food,
		g = this.pathmatrix[f.x][f.y], 
		h = this.snake.queue[0],
		n = this.pathmatrix[h.x][h.y],
		s = 0,
		ns = n;
	do {
		s += 1;
		ns = ns.n;
		if (ns === n) return Infinity;
	} while (ns !== g);
	return s;
}

var frames, canvas, ctx, mainboard, paused=false, snakedir=[SNAKE.LEFT,SNAKE.UP,SNAKE.RIGHT,SNAKE.DOWN];
window.onresize = function () {
	frames = 0;
	canvas.height = framer.clientHeight;
	canvas.width = framer.clientWidth;
	mainboard = new BOARD(Math.floor(canvas.width / blocksize) - 1, Math.floor(canvas.height / blocksize) - 1);
	canvas.width = mainboard.mx * blocksize;
	canvas.height = mainboard.my * blocksize;
};
function inArray(array,item,comp) {
	for (var i of array) {
		if (comp(item,i))
			return true;
	}
	return false;
}
var ps; // when a rot is midway and needs another rot to keep condition. These are the rots around cycle
var init = function () {
	framer=document.body;
	canvas = document.createElement("canvas");
	canvas.onclick = function() { showpath = !showpath; }
	ctx = canvas.getContext("2d");
	if (document.getElementById('main')) framer=document.getElementById('main');
	framer.appendChild(canvas);
	window.onresize();
	loop();
	setInterval(AI,updatetime*10)
};
var loop = function () {
	frames++;
	if (frames % updatetime === 0) {
		if (!(ps || paused)) mainboard.snake.update();
		if (paused) mainboard.snake.direction = SNAKE.PAUSE;
		frames = 0;
	}
	mainboard.draw(ctx);
	window.requestAnimationFrame(loop, canvas);
};

var cycle8 = [{x:1,y:1},{x:-1,y:-1},{x:1,y:0},{x:0,y:1},{x:1,y:-1},{x:-1,y:1},{x:-1,y:0},{x:0,y:-1}];
function check(n1,n2) { return (diag(n1,n2,"n")?{n:"n",p:"p"}:0) || (diag(n1,n2,"p")?{n:"p",p:"n"}:0); }
function getNP(board,xy){ var X = board.pathmatrix[xy.x]; return X?X[xy.y]:undefined; }
function diag(n1,n2,n) {
	var d1 = n1[n], d2 = n2[n];
	return xydist(d1,d2) === 2 && d1.x!==d2.x && d1.y!==d2.y && Math.min(d1.x,d2.x) == n1.x && Math.max(d1.y,d2.y) == n2.y;
}
function cycleGen(board,n) {
	cycle = [];
	for (var x=0; x<board.mx; x++) cycle.push([]);
	for (var xy of xymatrix(board.mx,board.my)) cycle[xy.x].push(0);
	
	var s = n;
	do {
		cycle[s.x][s.y] = 1;
		s = s.n;
	} while (s !== n);
	
	return cycle;
}
function _rot(board,n) {
	if (ps && !inArray(ps,n,xysame)) return;
	if (!n) return false;
	var n1 = getNP(board,n);
	if (!n1) return false;
	if (board.matrix[n1.x][n1.y]) return false;
	var n2 = getNP(board,{x:n.x+1,y:n.y+1});
	if (!n2) return false; // it was in max side edge
	if (board.matrix[n2.x][n2.y]) return false;
	
	var np = check(n1,n2); // get next or prev and check if they're diagonals
	if (!np) return false;
	var d1 = n1[np.n], d2 = n2[np.n];
	if (board.matrix[d1.x][d1.y]) return false;
	if (board.matrix[d2.x][d2.y]) return false;

	n1[np.n]=d2; n2[np.n]=d1;
	d1[np.p]=n2; d2[np.p]=n1;
	
	if (!ps) {
		var cycle = cycleGen(board,(Math.random()<.5)?n1:n2);
		ps = [];
		
		// TODO figure out a way to traverse a boundary instead of looking through all of the array
		for (var xy of xymatrix(board.mx-1,board.my-1)) {
			var n1 = getNP(board,xy),
				n2 = getNP(board,{x:xy.x+1,y:xy.y+1});
			if (cycle[n1.x][n1.y] + cycle[n2.x][n2.y] + cycle[n1.x][n2.y] + cycle[n2.x][n1.y] !== 2) continue;
			var np = check(n1,n2);
			if (!np) continue;
			ps.push(xy);
		}
	} else { ps = undefined; }
	return true;
}

// TODO I'm searching WAAAAY too many things that i dont need to
function _minrot(board) {
	var mrot = {d:Infinity};
	for (pxy of ps) {
		if (!_rot(board,pxy)) continue; // didnt make a move
		var d = board.snakeFoodDist();
		_rot(board,pxy) // undo loop rot
		if (mrot.d < d) continue;
		mrot.n = pxy;
		mrot.d = d;
	}
	return mrot;
}
function minrot(board) {
	if (ps) return;
	var mrot = {d:Infinity};
	for (var xy of xymatrix(board.mx-1,board.my-1)) {
		if (!_rot(board,xy)) continue; // didnt make a move
		var minps = _minrot(board); // find the min ps move
		_rot(board,xy); // undo the original rot
		if (mrot.d < minps.d) continue;
		mrot = {n:xy,n2:minps.n,d:minps.d};
	}
	if (!(mrot.d === Infinity || xysame(mrot.n,mrot.n2))){
		_rot(board,mrot.n);
		_rot(board,mrot.n2);
		return mrot;
	}
}

var AI, ai = 1, minded = 0;
AI = function () {
	if (!ai || paused) return;
	
	if (mainboard.food && minded--<0) {
		while (minrot(mainboard));
		minded = mainboard.snakeFoodDist()
		if (minded>10) minded/=2;
	}
	
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