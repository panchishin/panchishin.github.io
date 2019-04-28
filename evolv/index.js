const canvas = document.getElementById("canvas");

const context = canvas.getContext('2d');


let MAX_SIZE = 0;

let x = .5;
let y = .5;
let size = .02;
let move = .01;

let bots = [];
let foods = [];

let cameraX = 0.5;
let cameraY = 0.5;

for(let i=0;i<10;i++) bots.push( new makeBot(Math.random(),Math.random(),Math.random()*Math.PI*2,.1));
for(let i=0;i<200;i++) foods.push( new makeFood(Math.random(),Math.random()));


const reportFPS = createFPSReporter("fps");


const controller = makeController({
    'default' : { desc : 'default', funct : function(keyCode,deltaSeconds){ console.log("undefined action '"+keyCode+"'") } },
    '37' : { desc : 'left' , 
        funct : function(keyCode,deltaSeconds) { cameraX=(cameraX-move+2)%1 }
    },
    '39' : { desc : 'right' , 
        funct : function(keyCode,deltaSeconds) { cameraX=(cameraX+move+2)%1 }
    },
    '38' : { desc : 'up' , 
        funct : function(keyCode,deltaSeconds) { cameraY=(cameraY-move+2)%1 }
    },
    '40' : { desc : 'down' , 
        funct : function(keyCode,deltaSeconds) { cameraY=(cameraY+move+2)%1 }
    }
});


let lastDraw = 0;


function draw() {
    let now = Date.now()/1000;
    let deltaSeconds = now - lastDraw;
    if ( lastDraw == 0 ) {
        lastDraw = now;
    } else if ( deltaSeconds > .01 ) {
        reportFPS();
        controller.update(deltaSeconds,now)
        physics(deltaSeconds,now);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "rgba(0,200,0,1)";
        context.fillRect(MAX_SIZE*x, MAX_SIZE*y, MAX_SIZE*size, MAX_SIZE*size);
        for(let i in bots) { bots[i].draw(MAX_SIZE,cameraX,cameraY) }
        for(let i in foods) { foods[i].draw(MAX_SIZE,cameraX,cameraY) }
        lastDraw = now;
    }

    window.requestAnimationFrame(draw);
}

function physics(deltaSeconds,now) {
    for(let i in bots) { bots[i].physics(deltaSeconds) }
    for(let i in foods) { foods[i].physics(deltaSeconds) }

    for(let bi in bots) {
        for(let fi=foods.length-1 ; fi>=0 ; fi--) {
            if (collide(bots[bi],foods[fi])) {
                foods.splice(fi,1)
            }
        }
    }

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
