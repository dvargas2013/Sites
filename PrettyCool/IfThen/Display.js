var
  GridColor = "#0004"
, GateBackground = "#444"
, InPortBackground = "green"
, OutPortBackground = "red"
, WireStroke = "black"
;


class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	scale(s) {
		return new Point(this.x*s, this.y*s);
	}
	add(x, y) {
		return new Point(this.x+x, this.y+y);
	}
	sub(x, y) {
		return new Point(this.x-x, this.y-y);
	}
	addPoint(p) {
		return this.add(p.x, p.y);
	}
	subPoint(p) {
		return this.sub(p.x, p.y);
	}
	d2(p) {
		var dx = p.x-this.x,
			dy = p.y-this.y;
		return dx*dx+dy*dy;
	}
	toArray() {
		return Object.values(this);
	}
}

class BoundingBox {
	constructor(x,y,w,h) {
		this.lt = x;
		this.rt = x+w;
		this.tp = y;
		this.bt = y+h;
	}
	clip(x, y) {
		// makes sure the point is within the bounds
		return [Math.min(Math.max(x, this.lt), this.rt),
				Math.min(Math.max(y, this.tp), this.bt)];
	}
	clipPoint(p) {
		return this.clip(p.x, p.y);
	}
	clipXYXY(x0,y0,x1,y1) {
		// returns 4item array with xywh useful for ctx.fillRect
		[x0, y0] = this.clip(x0,y0);
		[x1, y1] = this.clip(x1,y1);
		return [x0, y0, x1-x0, y1-y0];
	}
	clipXYWH(x,y,w,h) {
		return this.clipXYXY(x,y,x+w,y+h);
	}
}

class Grid {
	constructor(size, x, y, w, h) {
		this.size = size; // size of the squares
		this.box = new BoundingBox(x,y,x+w,y+h);  // where in the ctx it's located
		this.p0 = new Point(x, y); // offset of grid point 0,0
	}
	getPoint(x, y) {
		// given float x,y representing position in grid get pixel points
		return this.p0.add(this.size*x, this.size*y);
	}
	fillRect(x, y, w, h) {
		// Fill specified squares in grid
		var s = this.size;
		var x0y0 = this.p0.add(s*x, s*y).toArray();
		ctx.fillRect(...this.box.clipXYWH(...x0y0, s*w, s*h));
	}
	fillCircle(x, y, r) {
		// TODO clipping for circles
		ctx.beginPath();
		ctx.arc(...this.getPoint(x, y).toArray(), r*this.size, 0, 7);
		ctx.fill();
	}
	strokeLine(x1, y1, x2, y2) {
		ctx.beginPath();
		ctx.moveTo(...this.getPoint(x1,y1).toArray());
		ctx.lineTo(...this.getPoint(x2,y2).toArray());
		ctx.stroke();
	}
	draw() {
		var xx = this.size*Math.ceil((this.box.lt - this.p0.x)/this.size),
			yy = this.size*Math.ceil((this.box.tp - this.p0.y)/this.size);
		
		ctx.strokeStyle = GridColor;
        ctx.lineWidth = 1;
		ctx.beginPath();
		for (var x=this.p0.x + xx; x < this.box.rt; x += this.size) {
			ctx.moveTo(x, this.box.tp);
			ctx.lineTo(x, this.box.bt);
		}
		for (var y=this.p0.y + yy; y < this.box.bt; y += this.size) {
			ctx.moveTo(this.box.lt, y);
			ctx.lineTo(this.box.rt, y);
		}
		ctx.stroke();
	}
}