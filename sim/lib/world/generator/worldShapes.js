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