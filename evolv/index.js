const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');


let MAX_SIZE = 0;

let x = .5;
let y = .5;
let size = .02;
let move = .01;

let showBoidDebug = false;

let boids = [];

function makeBoid(xParam,yParam,facingParam,speedParam) {
    let x = xParam;
    let y = yParam;
    let facing = facingParam; // facing 0 is East, pi/2 is North
    let speed = speedParam;

    let drawFacing = function() {
        context.strokeStyle = "rgba(100,100,100,1)";
        let dx = Math.sin(facing);
        let dy = Math.cos(facing);
        context.beginPath();
        context.moveTo(MAX_SIZE*x,MAX_SIZE*y);
        context.lineTo(MAX_SIZE*(x+dx/10),MAX_SIZE*(y+dy/10));
        context.stroke();
    }

    let drawArea = function() {
        context.strokeStyle = "rgba(100,100,100,1)";
        context.beginPath();
        context.arc(MAX_SIZE*x,MAX_SIZE*y, MAX_SIZE*size, 0, Math.PI * 2, true);
        context.stroke();
    }

    let drawBody = function() {
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

    let draw = function() {
        if (showBoidDebug) {
            drawFacing();
            drawArea();
        }
        drawBody();
    }

    let move = function(deltaSeconds) {
        facing += (Math.random()-.5) * Math.PI * deltaSeconds;
        let dx = Math.sin(facing);
        let dy = Math.cos(facing);
        x += dx * speed * deltaSeconds;
        y += dy * speed * deltaSeconds;

        x = (x+1)%1;
        y = (y+1)%1;
    }


    return { draw : draw , move : move };
}

for(let i=0;i<20;i++) {
    boids.push(makeBoid(Math.random(),Math.random(),Math.random()*Math.PI*2,.15*(Math.random()+.5)))
}

const reportFPS = createFPSReporter("fps");


const controller = makeController({
    'default' : { desc : 'default', funct : function(keyCode,deltaSeconds){ console.log("undefined action '"+keyCode+"'") } },
    '37' : { desc : 'left' , 
        funct : function(keyCode,deltaSeconds) { x=(x-move+1)%1 }
    },
    '39' : { desc : 'right' , 
        funct : function(keyCode,deltaSeconds) { x=(x+move)%1 }
    },
    '38' : { desc : 'up' , 
        funct : function(keyCode,deltaSeconds) { y=(y-move+1)%1 }
    },
    '40' : { desc : 'down' , 
        funct : function(keyCode,deltaSeconds) { y=(y+move)%1 }
    }
});


let lastDraw = 0;


function draw() {
    let now = Date.now()/1000;
    let deltaSeconds = now - lastDraw;
    if ( lastDraw == 0 ) {
        lastDraw = now;
    } else if ( deltaSeconds > .010 ) {
        reportFPS();
        controller.update(deltaSeconds,now)
        physics(deltaSeconds,now);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "rgba(0,200,0,1)";
        context.fillRect(MAX_SIZE*x, MAX_SIZE*y, MAX_SIZE*size, MAX_SIZE*size);
        for(let i in boids) { boids[i].draw() }
        lastDraw = now;
    }
    window.requestAnimationFrame(draw);
}

function physics(deltaSeconds,now) {
    let lambda = Math.pow(.8,deltaSeconds)
    x = x*lambda + .5*(1-lambda);
    y = y*lambda + .5*(1-lambda);
    for(let i in boids) { boids[i].move(deltaSeconds) }
}


function reshapeCanvas(size) {
    MAX_SIZE = size || Math.min(window.innerWidth - 22,window.innerHeight - 202);
    canvas.width = MAX_SIZE;
    canvas.height = MAX_SIZE;
}


function init() {
    reshapeCanvas();
    window.requestAnimationFrame(draw);
}


window.onload = init;
