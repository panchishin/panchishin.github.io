
let showBoidDebug = false;

function makeBot(xParam,yParam,facingParam,speedParam) {

    let x = xParam;
    let y = yParam;
    let facing = facingParam; // facing 0 is East, pi/2 is North
    let speed = speedParam;

    let drawFacing = function(MAX_SIZE,x,y) {
        context.strokeStyle = "rgba(100,100,100,1)";
        let dx = Math.sin(facing);
        let dy = Math.cos(facing);
        context.beginPath();
        context.moveTo(MAX_SIZE*x,MAX_SIZE*y);
        context.lineTo(MAX_SIZE*(x+dx/10),MAX_SIZE*(y+dy/10));
        context.stroke();
    }

    let drawArea = function(MAX_SIZE,x,y) {
        context.strokeStyle = "rgba(100,100,100,1)";
        context.beginPath();
        context.arc(MAX_SIZE*x,MAX_SIZE*y, MAX_SIZE*size, 0, Math.PI * 2, true);
        context.stroke();
    }

    let drawBody = function(MAX_SIZE,x,y) {
        context.fillStyle = "rgba(200,0,0,1)";
        function rotateX(angle) { return MAX_SIZE*(x+Math.sin(facing+angle)*size) }
        function rotateY(angle) { return MAX_SIZE*(y+Math.cos(facing+angle)*size) }
        context.beginPath();
        context.moveTo(rotateX(0),rotateY(0));
        context.lineTo(rotateX(Math.PI*0.75),rotateY(Math.PI*0.75));
        context.lineTo(rotateX(Math.PI*1.25),rotateY(Math.PI*1.25));
        context.fill();

        context.moveTo(rotateX(0),rotateY(0));
    }

    let draw = function(MAX_SIZE,cameraX,cameraY) {
        let nx = ((x-cameraX+2)%1)
        let ny = ((y-cameraY+2)%1)
        if (showBoidDebug) {
            drawFacing(MAX_SIZE,nx,ny);
            drawArea(MAX_SIZE,nx,ny);
        }
        drawBody(MAX_SIZE,nx,ny);
    }

    let physics = function(deltaSeconds) {
        facing += (Math.random()-.5) * Math.PI * deltaSeconds;
        let dx = Math.sin(facing);
        let dy = Math.cos(facing);
        x += dx * speed * deltaSeconds;
        y += dy * speed * deltaSeconds;

        x = (x+1)%1;
        y = (y+1)%1;
    }


    return { draw : draw , physics : physics };
}



function makeFood(xParam,yParam,sizeParam) {
    let x = xParam || Math.random();
    let y = yParam || Math.random();
    let size = sizeParam || 0.01;

    let draw = function(MAX_SIZE,cameraX,cameraY) {
        let nx = ((x-cameraX+2)%1)
        let ny = ((y-cameraY+2)%1)
        context.fillStyle = "rgba(0,200,0,1)";
        context.beginPath();
        context.arc(MAX_SIZE*nx,MAX_SIZE*ny, MAX_SIZE*size, 0, Math.PI * 2, true);
        context.fill();    
    }

    let physics = function(deltaSeconds) {
    }

    return { draw : draw , physics : physics };    

}



