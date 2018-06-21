const Random=require("../../random.js");
const Noise=require("./perlin.js");

const WORLD_SHAPES=require("./worldShapes.js");

module.exports=class WorldGenerator {
	constructor({radius=50,amplitude=1024,frequency=radius/5,octaves=3,persistence=2,seed=Date.now(),shape="circle"}) {
		this.random=Random(seed);
		
		this.radius=radius;
		this.radiusSquared=this.radius*this.radius;
		
		this.amplitude=amplitude;
		this.frequency=frequency;
		this.octaves=octaves;
		this.persistence=persistence;
		
		this.distance=WORLD_SHAPES[shape];
		
		this.noise=new Noise(this.random);
	}

	value(x,y,z=0) {
		var d=this.distance(x,y,z);
		if(d > 2) {
			return 0;
		}		

		var val=0;
		var frequency=this.frequency;
		var amplitude=this.amplitude; 1;
		var totalAmplitude=0;
		for(let i=0;i<this.octaves;++i) {
			val+=this.noise.perlin3(x/frequency,y/frequency,z/frequency)*amplitude;
			totalAmplitude+=amplitude;
			frequency/=2;
			amplitude/=this.persistence;
		}

		val/=totalAmplitude;
		
		// shift range from [-1,1] to [0,2]
		val++;

		// if outside of the area, fade it out
		if(d>1) {
			val-=this.noise.fade(d-1);
		}

		return val;
	}
	
};
