const WorldGenerator=require("./generator/worldGenerator.js")
const Cell=require("./cell.js");


module.exports=class World {
	constructor(conf) {
		this.grid=[];
			
		this.top=-conf.radius*2;
		this.bottom=conf.radius*2;
		this.left=-conf.radius*2;
		this.right=conf.radius*2;
		
		this.width=this.right-this.left;
		this.height=this.bottom-this.top;
		
		this.generator=new WorldGenerator(conf);
		
		for(var x=this.left;x<this.right;++x) {
			this.grid[x]=[];
			for(var y=this.top;y<this.bottom;++y) {
				this.grid[x][y]=[];
			}
		}
	}

	* doWorldgen() {
			
	}

	node(x,y,z=0) {
		if(x<this.left || x>=this.right || y<this.top || y>=this.bottom) {
			throw new Error("Coordinate ("+x+","+y+") is outside of bounds ("
				+this.left+","+this.top+" - "+this.right+","+this.bottom+")");
		}
		
		if(!this.grid[x][y][z]) {
			var val=this.generator.value(x,y,z);
			this.grid[x][y][z]=new Cell(x,y,z,val);
		}
		
		return this.grid[x][y][z];
	}

	visitAll(fn,z=0) {
		for(var y=this.top;y<this.bottom;++y) {
			for(var x=this.left;x<this.right;++x) {
				fn(this.node(x,y,z),x,y,z);
			}
		}			
	}
		
	visitAdjacencies(fn) {
		for(var y=this.top+1;y<this.bottom;++y) {
			for(var x=this.left+1;x<this.right;++x) {
				fn(this.grid[x-1][y],this.grid[x][y]);
				fn(this.grid[x][y-1],this.grid[x][y]);
			}
		}				
	}
}
