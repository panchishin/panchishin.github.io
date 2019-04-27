const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');


let MAX_SIZE = 0;

let x = .5;
let y = .5;
let size = .02;
let move = .01;

let bots = [];



for(let i=0;i<20;i++) {
    bots.push(makeBot(Math.random(),Math.random(),Math.random()*Math.PI*2,.15*(Math.random()+.5)))
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
        for(let i in bots) { bots[i].draw() }
        lastDraw = now;
    }
    window.requestAnimationFrame(draw);
}

function physics(deltaSeconds,now) {
    let lambda = Math.pow(.8,deltaSeconds)
    x = x*lambda + .5*(1-lambda);
    y = y*lambda + .5*(1-lambda);
    for(let i in bots) { bots[i].physics(deltaSeconds) }
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
