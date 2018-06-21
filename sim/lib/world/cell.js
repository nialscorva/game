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