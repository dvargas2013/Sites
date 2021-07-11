var canvas = document.getElementById("game"),
    ctx = canvas.getContext("2d"),
    grid = new Grid(10, 50, 50, 300, 300),
    callbacks = activateCanvasListener(canvas);

var draw = (function() {
    var gate1 = multiplexor.make_gate(0,0);
	var gate2 = multiplexor.make_gate(4,4);
    new Wire(gate1.outputs[1], gate2.inputs[1]);
	callbacks.click.push(function(p) {
		grid.p0 = new Point(p.x-5, p.y-10);
	});

	return function() {
		ctx.clearRect(0,0,600,600);
		grid.draw(ctx);
		gate1.draw(grid);
		gate2.draw(grid);
		requestAnimationFrame(draw);
	}
})();

draw();