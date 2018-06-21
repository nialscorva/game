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