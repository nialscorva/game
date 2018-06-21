(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports=class CanvasView {
	constructor(grid,el) {
		this.grid=grid;
		this.el=el;
		this.ctx=el[0].getContext('2d');

		this.top=grid.top;
		this.bottom=grid.bottom;
		this.left=grid.left;
		this.right=grid.right;
	}
	
	render(z=0) {
		this.ctx.canvas.width=this.grid.width;
		this.ctx.canvas.height=this.grid.height;
		var image=this.ctx.createImageData(this.grid.width, this.grid.height);

		var offset=(x,y)=>{
			return (
				(y-this.grid.top)*this.grid.width
				+x-this.grid.left
				)*4;
		}
		var count=0;
		var max=0;
		this.grid.visitAll((c,x,y) => {
			++count;
			var o=offset(x,y);
			
			var color=c.val*100+64;
			if(c.val <= 0.5) {
				color=0;
			}
			
			max=Math.max(c.val,max);
			image.data[o]=
			image.data[o+1]=
			image.data[o+2]=color;
			image.data[o+3]=255;
		},z);
		this.ctx.putImageData(image,0,0);
	}
}
},{}],2:[function(require,module,exports){
// From http://baagoe.com/en/RandomMusings/javascript/

module.exports=(function() {
function Mash() {
    var n = 0xefc8249d;
  
    var mash = function(data) {
      data = data.toString();
      for (var i = 0; i < data.length; i++) {
        n += data.charCodeAt(i);
        var h = 0.02519603282416938 * n;
        n = h >>> 0;
        h -= n;
        h *= n;
        n = h >>> 0;
        h -= n;
        n += h * 0x100000000; // 2^32
      }
      return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    };
  
    mash.version = 'Mash 0.9';
    return mash;
}

return function AleaRandom() {
    return (function(args) {
      // Johannes Baagøe <baagoe@baagoe.com>, 2010
      var s0 = 0;
      var s1 = 0;
      var s2 = 0;
      var c = 1;
  
      if (args.length == 0) {
        args = [+new Date];
      }
      var mash = Mash();
      s0 = mash(' ');
      s1 = mash(' ');
      s2 = mash(' ');
  
      for (var i = 0; i < args.length; i++) {
        s0 -= mash(args[i]);
        if (s0 < 0) {
          s0 += 1;
        }
        s1 -= mash(args[i]);
        if (s1 < 0) {
          s1 += 1;
        }
        s2 -= mash(args[i]);
        if (s2 < 0) {
          s2 += 1;
        }
      }
      mash = null;
  
      var random = function() {
        var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
        s0 = s1;
        s1 = s2;
        return s2 = t - (c = t | 0);
      };
      random.uint32 = function() {
        return random() * 0x100000000; // 2^32
      };
      random.fract53 = function() {
        return random() + 
          (random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
      };
      random.version = 'Alea 0.9';
      random.args = args;
      return random;
  
    } (Array.prototype.slice.call(arguments)));
  };
})();
},{}],3:[function(require,module,exports){
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
},{"./canvasView.js":1,"./world/world.js":8}],4:[function(require,module,exports){
module.exports=class Cell {
	constructor(x,y,z,val) {
		this.x=x;
		this.y=y;
		this.z=z;
		this.val=val;
		this.deltas=[];
	}
	
	commit() {
		this.val=this.deltas.reduce((a,b)=>a+b,this.val);
		this.deltas=[];
	}
	
	addDelta(v) {
		this.deltas.push(v);
	}
}
},{}],5:[function(require,module,exports){
/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */

module.exports=(function () {

    // Skewing and unskewing factors for 2, 3, and 4 dimensions
    var F2 = 0.5 * (Math.sqrt(3) - 1);
    var G2 = (3 - Math.sqrt(3)) / 6;

    var F3 = 1 / 3;
    var G3 = 1 / 6;

  var Grad=class Grad {
    constructor(x, y, z) {
      this.x = x; this.y = y; this.z = z;
    }

    dot2(x, y) {
      return this.x * x + this.y * y;
    };

    dot3(x, y, z) {
      return this.x * x + this.y * y + this.z * z;
    };

  }
  var grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
    new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
    new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];

  return class Noise {

    constructor(random) {
      this.random=random;



      this.perm = [151, 160, 137, 91, 90, 15,
        131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
        190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
        88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
        77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
        102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
        135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
        5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
        223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
        129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
        251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
        49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
        138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
      
      // To remove the need for index wrapping, double the permutation table length
      this.gradP = new Array(512);

      for(var i = 255; i > 0; i--) {
        let r=this.random.uint32();
        let rIndex=(r%i);
        // Switch values to shuffle
        [this.perm[i],this.perm[rIndex]]=[this.perm[rIndex],this.perm[i]];
        // make sure the latter value gets pushed into the higher bits
        this.perm[i + 256] = this.perm[i];

        this.gradP[i] = this.gradP[i + 256] = grad3[r % grad3.length];
      }
      
      this.gradP[0] = this.gradP[256] = grad3[this.random.uint32() % grad3.length];
      this.perm[256]=this.perm[0];
      for(let i=0; i< 512; ++i) {
        if(this.perm[i]===undefined) {
          console.error("Undefined perm[",i,"]");
        }
        if(this.gradP[i]===undefined) {
          console.error("Undefined gradP[",i,"]");
        }        
      }

    }
    // 2D simplex noise
    simplex2(xin, yin) {
      var n0, n1, n2; // Noise contributions from the three corners
      // Skew the input space to determine which simplex cell we're in
      var s = (xin + yin) * F2; // Hairy factor for 2D
      var i = Math.floor(xin + s);
      var j = Math.floor(yin + s);
      var t = (i + j) * G2;
      var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
      var y0 = yin - j + t;
      // For the 2D case, the simplex shape is an equilateral triangle.
      // Determine which simplex we are in.
      var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
      if (x0 > y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
        i1 = 1; j1 = 0;
      } else {    // upper triangle, YX order: (0,0)->(0,1)->(1,1)
        i1 = 0; j1 = 1;
      }
      // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
      // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
      // c = (3-sqrt(3))/6
      var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
      var y1 = y0 - j1 + G2;
      var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
      var y2 = y0 - 1 + 2 * G2;
      // Work out the hashed gradient indices of the three simplex corners
      i &= 255;
      j &= 255;
      var gi0 = this.gradP[i + this.perm[j]];
      var gi1 = this.gradP[i + i1 + this.perm[j + j1]];
      var gi2 = this.gradP[i + 1 + this.perm[j + 1]];
      // Calculate the contribution from the three corners
      var t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 < 0) {
        n0 = 0;
      } else {
        t0 *= t0;
        n0 = t0 * t0 * gi0.dot2(x0, y0);  // (x,y) of grad3 used for 2D gradient
      }
      var t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 < 0) {
        n1 = 0;
      } else {
        t1 *= t1;
        n1 = t1 * t1 * gi1.dot2(x1, y1);
      }
      var t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 < 0) {
        n2 = 0;
      } else {
        t2 *= t2;
        n2 = t2 * t2 * gi2.dot2(x2, y2);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to return values in the interval [-1,1].
      return 70 * (n0 + n1 + n2);
    }

    // 3D simplex noise
    simplex3(xin, yin, zin) {
      var n0, n1, n2, n3; // Noise contributions from the four corners

      // Skew the input space to determine which simplex cell we're in
      var s = (xin + yin + zin) * F3; // Hairy factor for 2D
      var i = Math.floor(xin + s);
      var j = Math.floor(yin + s);
      var k = Math.floor(zin + s);

      var t = (i + j + k) * G3;
      var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
      var y0 = yin - j + t;
      var z0 = zin - k + t;

      // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
      // Determine which simplex we are in.
      var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
      var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
      if (x0 >= y0) {
        if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
        else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
      } else {
        if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
        else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
        else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      }
      // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
      // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
      // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
      // c = 1/6.
      var x1 = x0 - i1 + G3; // Offsets for second corner
      var y1 = y0 - j1 + G3;
      var z1 = z0 - k1 + G3;

      var x2 = x0 - i2 + 2 * G3; // Offsets for third corner
      var y2 = y0 - j2 + 2 * G3;
      var z2 = z0 - k2 + 2 * G3;

      var x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner
      var y3 = y0 - 1 + 3 * G3;
      var z3 = z0 - 1 + 3 * G3;

      // Work out the hashed gradient indices of the four simplex corners
      i &= 255;
      j &= 255;
      k &= 255;
      var gi0 = this.gradP[i + this.perm[j + this.perm[k]]];
      var gi1 = this.gradP[i + i1 + this.perm[j + j1 + this.perm[k + k1]]];
      var gi2 = this.gradP[i + i2 + this.perm[j + j2 + this.perm[k + k2]]];
      var gi3 = this.gradP[i + 1 + this.perm[j + 1 + this.perm[k + 1]]];

      // Calculate the contribution from the four corners
      var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 < 0) {
        n0 = 0;
      } else {
        t0 *= t0;
        n0 = t0 * t0 * gi0.dot3(x0, y0, z0);  // (x,y) of grad3 used for 2D gradient
      }
      var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 < 0) {
        n1 = 0;
      } else {
        t1 *= t1;
        n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
      }
      var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t2 < 0) {
        n2 = 0;
      } else {
        t2 *= t2;
        n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
      }
      var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 < 0) {
        n3 = 0;
      } else {
        t3 *= t3;
        n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to return values in the interval [-1,1].
      return 32 * (n0 + n1 + n2 + n3);

    };

    // ##### Perlin noise stuff

    fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a, b, t) {
      return (1 - t) * a + t * b;
    }

    // 2D Perlin Noise
    perlin2(x, y) {
      // Find unit grid cell containing point
      var X = Math.floor(x), Y = Math.floor(y);
      // Get relative xy coordinates of point within that cell
      x = x - X; y = y - Y;
      // Wrap the integer cells at 255 (smaller integer period can be introduced here)
      X = X & 255; Y = Y & 255;

      // Calculate noise contributions from each of the four corners
      var n00 = this.gradP[X + this.perm[Y]].dot2(x, y);
      var n01 = this.gradP[X + this.perm[Y + 1]].dot2(x, y - 1);
      var n10 = this.gradP[X + 1 + this.perm[Y]].dot2(x - 1, y);
      var n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2(x - 1, y - 1);

      // Compute the fade curve value for x
      var u = this.fade(x);

      // Interpolate the four results
      return this.lerp(
        this.lerp(n00, n10, u),
        this.lerp(n01, n11, u),
        this.fade(y));
    };

    // 3D Perlin Noise
    perlin3(x, y, z) {
      // Find unit grid cell containing point
      var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
      // Get relative xyz coordinates of point within that cell
      x = x - X; y = y - Y; z = z - Z;
      // Wrap the integer cells at 255 (smaller integer period can be introduced here)
      X = X & 255; Y = Y & 255; Z = Z & 255;

      // Calculate noise contributions from each of the eight corners
      var n000 = this.gradP[X + this.perm[Y + this.perm[Z]]].dot3(x, y, z);
      var n001 = this.gradP[X + this.perm[Y + this.perm[Z + 1]]].dot3(x, y, z - 1);
      var n010 = this.gradP[X + this.perm[Y + 1 + this.perm[Z]]].dot3(x, y - 1, z);
      var n011 = this.gradP[X + this.perm[Y + 1 + this.perm[Z + 1]]].dot3(x, y - 1, z - 1);
      var n100 = this.gradP[X + 1 + this.perm[Y + this.perm[Z]]].dot3(x - 1, y, z);
      var n101 = this.gradP[X + 1 + this.perm[Y + this.perm[Z + 1]]].dot3(x - 1, y, z - 1);
      var n110 = this.gradP[X + 1 + this.perm[Y + 1 + this.perm[Z]]].dot3(x - 1, y - 1, z);
      var n111 = this.gradP[X + 1 + this.perm[Y + 1 + this.perm[Z + 1]]].dot3(x - 1, y - 1, z - 1);

      // Compute the this.fade curve value for x, y, z
      var u = this.fade(x);
      var v = this.fade(y);
      var w = this.fade(z);

      // Interpolate
      return this.lerp(
        this.lerp(
          this.lerp(n000, n100, u),
          this.lerp(n001, n101, u), w),
        this.lerp(
          this.lerp(n010, n110, u),
          this.lerp(n011, n111, u), w),
        v);
    }

  }
})();
},{}],6:[function(require,module,exports){
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

},{"../../random.js":2,"./perlin.js":5,"./worldShapes.js":7}],7:[function(require,module,exports){
module.exports={
    
        // distance from "center" in units of object radius
        diamond: function(x,y,z) {
            // diamond shape (manhattan distance)
            return (Math.abs(x)+Math.abs(y)+Math.abs(z))/this.radius;
        },
    
        circle:function(x,y,z) {
            return (x*x+y*y+z*z)/this.radiusSquared;
        },
    
        peanut:function(x,y,z) {
            var y1=y-this.radius/2;
            var y2=y+this.radius/2;
        
            return (Math.min(y1*y1,y2*y2)+x*x+z*z)/(this.radiusSquared*0.75*0.75);
        }
    }
},{}],8:[function(require,module,exports){
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

},{"./cell.js":4,"./generator/worldGenerator.js":6}]},{},[3]);
