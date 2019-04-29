
let showBoidDebug = false;

function makeBot(xParam,yParam,facingParam,speedParam) {

    this.x = xParam;
    this.y = yParam;
    let facing = facingParam; // facing 0 is East, pi/2 is North
    this.speed = speedParam;
    this.size = 0.02;

    this.drawFacing = function(MAX_SIZE,x,y) {
        context.strokeStyle = "rgba(100,100,100,1)";
        let dx = Math.sin(facing);
        let dy = Math.cos(facing);
        context.beginPath();
        context.moveTo(MAX_SIZE*x,MAX_SIZE*y);
        context.lineTo(MAX_SIZE*(x+dx/10),MAX_SIZE*(y+dy/10));
        context.stroke();
    }

    this.drawArea = function(MAX_SIZE,x,y) {
        context.strokeStyle = "rgba(100,100,100,1)";
        context.beginPath();
        context.arc(MAX_SIZE*x,MAX_SIZE*y, MAX_SIZE*this.size, 0, Math.PI * 2, true);
        context.stroke();
    }

    this.drawBody = function(MAX_SIZE,x,y) {
        context.fillStyle = "rgba(200,0,0,1)";
        let that = this;
        function rotateX(angle) { return MAX_SIZE*(x+Math.sin(facing+angle)*that.size) }
        function rotateY(angle) { return MAX_SIZE*(y+Math.cos(facing+angle)*that.size) }
        context.beginPath();
        context.moveTo(rotateX(0),rotateY(0));
        context.lineTo(rotateX(Math.PI*0.75),rotateY(Math.PI*0.75));
        context.lineTo(rotateX(Math.PI*1.25),rotateY(Math.PI*1.25));
        context.fill();

        context.moveTo(rotateX(0),rotateY(0));
    }

    this.draw = function(MAX_SIZE,cameraX,cameraY) {
        let nx = ((this.x-cameraX+2)%1)
        let ny = ((this.y-cameraY+2)%1)
        if (showBoidDebug) {
            this.drawFacing(MAX_SIZE,nx,ny);
            this.drawArea(MAX_SIZE,nx,ny);
        }
        this.drawBody(MAX_SIZE,nx,ny);
    }

    this.physics = function(deltaSeconds) {
        facing += (Math.random()-.5) * Math.PI * deltaSeconds;
        let dx = Math.sin(facing);
        let dy = Math.cos(facing);
        this.x += dx * this.speed * deltaSeconds;
        this.y += dy * this.speed * deltaSeconds;

        this.x = (this.x+2)%1;
        this.y = (this.y+2)%1;
    }

    return this;
}



function makeFood(xParam,yParam,sizeParam) {
    this.x = xParam || Math.random();
    this.y = yParam || Math.random();
    this.size = sizeParam || 0.01;

    this.draw = function(MAX_SIZE,cameraX,cameraY) {
        let nx = ((this.x-cameraX+2)%1)
        let ny = ((this.y-cameraY+2)%1)
        context.fillStyle = "rgba(0,200,0,1)";
        context.beginPath();
        context.arc(MAX_SIZE*nx,MAX_SIZE*ny, MAX_SIZE*this.size, 0, Math.PI * 2, true);
        context.fill();    
    }

    this.physics = function(deltaSeconds) {
    }

    return this;

}


let distance = function(a,b) {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    return Math.sqrt( dx*dx + dy*dy );
}

let collide = function(a,b) {
    return distance(a,b) < Math.max(a.size, b.size) + Math.min(a.size, b.size)/2;
}

