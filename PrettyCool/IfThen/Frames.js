class Queue {
	constructor() {
		this._items = [];
	}
	push(item) {
		this._items.push(item);
	}
	pop() {
		return this._items.shift();
	}
	empty() {
		return this._items.length == 0;
	}
}

function activateCanvasListener(canvas) {
/* Made to detect:
down up -> click
down move up -> drag
down move out in move up -> drag 
down move out [up] in -> cancel
down move out [up down] in move up -> drag 

events in [] are inherently unknowable
the simplest thing would be to cancel the moment it leaves the canvas
but i feel like if i accidently leave the canvas and come back it should still detect*/
	if (callbacks !== undefined) return;

	var callp = function(cb) { cb(this); },
		call = function(cb) { cb(); };
	
	var self = {
		drag: false,
		out: 0,
		
		dragstart(p) {
			this.dragging = true;
			callbacks.dragstart.forEach(callp, p);
		},
		dragend(p) {
			this.dragging = false;
			callbacks.dragend.forEach(callp, p);
		},
		dragcancel() {
			this.dragging = false;
			callbacks.dragcancel.forEach(call);
		},
		dragmove(p) {
			self.point = undefined;
			callbacks.dragmove.forEach(callp, p);
		},
		click(p) {
			self.point = undefined;
			callbacks.click.forEach(callp, p);
		},
		move(p) {
			callbacks.move.forEach(callp, p);
		}
	};
	
	canvas.addEventListener("mouseup", function(e) {
		var end = {x: e.offsetX, y: e.offsetY};
		if (self.dragging) {
			self.dragend(end);
			// u were dragging . so now its ending
		} else {
			self.click(end);
			// no drag . just a click
		}
	});
	canvas.addEventListener("mousedown", function(e) {
		// store and wait to determine if its a drag or not
		self.point = {x: e.offsetX, y: e.offsetY};
	})
	canvas.addEventListener("mouseout", function(e) {
		// store and wait for cursor to return
		self.outbuttons = e.buttons;
	});
	canvas.addEventListener("mouseenter", function(e) {
		// check to see if it returned in the same state
		if (self.dragging && e.buttons !== self.outbuttons) {
			// if its dragging cancel it. other states dont matter ... yet
			self.dragcancel();
		}
		// can be safely ignored if it exited and entered in same state
	});
	canvas.addEventListener("mousemove", function(e) {
		var curr = {x: e.offsetX, y: e.offsetY};
		if (!!e.buttons) {
			if (self.dragging) {
				self.dragmove(curr);
			} else {
				if (self.point !== undefined) {
					self.dragstart(self.point);
					// send the stored point from mousedown
					self.dragmove(curr);
				}
				// if mousedown didnt set a point
				// we clicked outside of the screen and continuing a drag from there
				// ignore it (mouseup will register it as a click when u let go)
			}
		} else {
			if (self.dragging) {
				self.dragcancel();
			} else {
				self.move(curr);
			}
		}
	});
	
	var callbacks = {
		dragstart: [],
		dragend: [],
		dragcancel: [],
		click: [],
		dragmove: [],
		move: []
	};

	return callbacks;
}