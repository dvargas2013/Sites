class Shape {
    constructor(width, height) {
        this.w = width;
        this.h = height;
    }
    draw(grid, x, y) {
        grid.fillRect(x, y, this.w, this.h);
    }
}

class PortLocation {
	constructor(x, y, loc) {
		this.x=x;
		this.y=y;
		this.loc=loc;
	}
	getGateDisplayLocation() {
		// in grid units with 0,0 at Gate Location
		var dx, dy;
		switch(this.loc) {
			case "UP":     dx = 0.5; dy = 0.1; break;
			case "DOWN":   dx = 0.5; dy = 0.9; break;
			case "LEFT":   dx = 0.1; dy = 0.5; break;
			case "RIGHT":  dx = 0.9; dy = 0.5; break;
            case "CENTER": dx = 0.5; dy = 0.5; break;
		}
		return new Point(this.x + dx, this.y + dy);
	}
}

class Port {
	constructor(parent, location, wires = []) {
		this.loc = location;
		this.parent = parent;
		this.wires = wires;
	}
	wire_on() {
		return this.wires.some(function(wire) { return wire._on; });
	}
	getGridDisplayLocation() {
        // in grid units with 0,0 at grid location
		return this.loc.getGateDisplayLocation().add(this.parent.x, this.parent.y);
	}
}

class InPort extends Port {
    constructor(parent, location, wires = []) {
        super(parent, location, wires);
        this._on = false; // to be able to detect changes
    }
	set() {
		var on = this.wire_on();
        if (this._on === on) return;
        this._on = on;
        // TODO figure out computation layer
        // this.parent.compute();
	}
}
class OutPort extends Port {
	constructor(parent, location, wires = []) {
		super(parent, location, wires)
		this.on = false; // OutPorts have their own energy source
	}
	set(bool) {
		if (this.on === bool) return;
		this.on = bool;
		this.wires.forEach(function(wire) { wire.propogate(); })
	}
}

class Wire {
	constructor(input, output) {
		this._on = false; // to be able to detect changes
		this.input = input; // OutPort to be propogated
		this.output = output; // InPort to be notified
        input.wires.push(this);
		output.wires.push(this);
	}
    propogate() {
		if (this._on === this.input.on) return; 
		this._on = this.input.on;
		this.output.set();
	}
}

class Gate {
	constructor(shape, input_locations, output_locations) {
		// TODO conceptualize a serialized form of innards
		// when empty should default to multiplexor
		this.shape = shape;

		this.inputs = [];
		for (var loc of input_locations) {
			this.inputs.push(new InPort(this, loc));
		}
		this.outputs = []
		for (var loc of output_locations) {
			this.outputs.push(new OutPort(this, loc));
		}
	}
	drawPorts(grid, ports) {
		for (var port of ports) {
			grid.fillCircle(...port.getGridDisplayLocation().toArray(), 0.2);
		}
	}
	drawBox(grid) {
		ctx.fillStyle = GateBackground;
		this.shape.draw(grid, this.x, this.y);
		ctx.fillStyle = InPortBackground;
		this.drawPorts(grid, this.inputs);
		ctx.fillStyle = OutPortBackground;
		this.drawPorts(grid, this.outputs);
	}
    drawWires(grid) {
        ctx.strokeStyle = WireStroke;
        ctx.lineWidth = 3;
		ctx.beginPath();
		for (var outport of this.outputs) {
			var xy1 = grid.getPoint(...outport.getGridDisplayLocation().toArray());
			for (var wire of outport.wires) {
                ctx.moveTo(...xy1.toArray());
				var xy2 = grid.getPoint(...wire.output.getGridDisplayLocation().toArray());
                ctx.lineTo(...xy2.toArray());
			}
		}
		ctx.stroke();
    }
	draw(grid) {
        this.drawWires(grid);
		this.drawBox(grid);
	}
}

class GateFactory {
	constructor(shape, input_locations, output_locations) {
		this.shape = shape;
		this.inputs = input_locations;
		this.outputs = output_locations;
	}

	make_gate(x, y) {
		var g = new Gate(this.shape, this.inputs, this.outputs);
		if (y !== undefined) {
			g.x = x;
			g.y = y;
		}
		return g;
	}
}

multiplexor = new GateFactory(new Shape(1,2),
	[new PortLocation(0,0,"UP"), new PortLocation(0,0,"LEFT"), new PortLocation(0,1,"LEFT")],
	[new PortLocation(0,0,"RIGHT"), new PortLocation(0,1,"RIGHT"), new PortLocation(0,1,"DOWN")]);
