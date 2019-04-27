const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');


let MAX_SIZE = 0;

let x = .5;
let y = .5;
let size = .04;
let move = .01


const reportFPS = createFPSReporter("fps");


const controller = makeController({
    'default' : { desc : 'default', funct : function(keyCode,deltaTime){ console.log("undefined action '"+keyCode+"'") } },
    '37' : { desc : 'left' , 
        funct : function(keyCode,deltaTime) { x=(x-move+1)%1 }
    },
    '39' : { desc : 'right' , 
        funct : function(keyCode,deltaTime) { x=(x+move)%1 }
    },
    '38' : { desc : 'up' , 
        funct : function(keyCode,deltaTime) { y=(y-move+1)%1 }
    },
    '40' : { desc : 'down' , 
        funct : function(keyCode,deltaTime) { y=(y+move)%1 }
    }
});


let lastDraw = 0;



function draw() {
    let now = Date.now();
    let deltaTime = now - lastDraw;
    if ( lastDraw == 0 ) {
        lastDraw = now;
    } else if ( deltaTime > 10 ) {
        reportFPS();
        controller.update(deltaTime,now)
        physics(deltaTime,now);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "rgba(0,200,0,1)";
        context.fillRect(MAX_SIZE*x, MAX_SIZE*y, MAX_SIZE*size, MAX_SIZE*size);
        lastDraw = now;
    }
    window.requestAnimationFrame(draw);
}

function physics(deltaTime,now) {
    let lambda = Math.pow(.8,deltaTime/1000)
    x = x*lambda + .5*(1-lambda);
    y = y*lambda + .5*(1-lambda);
}



function reshapeCanvas(size) {
    MAX_SIZE = size || Math.min(window.innerWidth - 22,window.innerHeight - 152);
    canvas.width = MAX_SIZE;
    canvas.height = MAX_SIZE;
}

function init() {
    reshapeCanvas();
    window.requestAnimationFrame(draw);
}

window.onload = init;

