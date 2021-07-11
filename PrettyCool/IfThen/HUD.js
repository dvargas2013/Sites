function drag_zoom_init() {
	var zoom = grid.size,
		p0 = undefined;
    return {
        dragstart: function(p){
            zoom = grid.size;
            p0 = p;
        },
	   dragmove: function(p){
		// 10 pixels 2x change: Math.E**(Math.log(2)/10)
		grid.size = zoom*Math.pow(1.07177, p.x-p0.x+p.y-p0.y);
		if (grid.size < 5) grid.size = 5;
		if (grid.size > 80) grid.size = 80;
       },
	   dragcancel: function(){
           grid.size = zoom;
	   }
    }
}
