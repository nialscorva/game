const World=require("./world/world.js");
const CanvasView=require("./canvasView.js");


var canvasView;
var world;

function generateMap() {
	world=new World({
		radius:  Number.parseInt($("#radius").val()),
		seed: Number.parseInt($("#seed").val())
	});

	canvasView=new CanvasView(world,$("#canvas"));
	
	canvasView.render();
}

$(function() {
	$("input").change(generateMap);
	
	generateMap();

	

	// function update() {
		// return new Promise(function(resolve) {
			// var start=Date.now();
			// grid.visitAdjacencies((g1,g2) => {
				// var delta=(g2.val-g1.val)*0.2;
				// g1.addDelta(delta);
				// g2.addDelta(-delta);
			// });
			// grid.visitAll((g)=> g.render());
			// console.log("Updated in ",Date.now()-start);
			// resolve();
		// });
	// }
	
//	update().then(function resolver() {
//		return update()
//			.then(resolver);
//	});
//	window.setInterval(update,200);
	
});