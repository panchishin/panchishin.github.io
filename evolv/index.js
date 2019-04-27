const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');


let MAX_SIZE = 0;

let x = .5;
let y = .5;
let size = .04;
let move = .01


const reportFPS = createFPSReporter("fps");


function reshapeit(size) {
    MAX_SIZE = size || Math.min(window.innerWidth - 22,window.innerHeight - 152);
    canvas.width = MAX_SIZE;
    canvas.height = MAX_SIZE;
}


const controller = makeController({
    default : { desc : 'default', funct : function(keyCode,deltaTime){ console.log("undefined action '"+keyCode+"'") } },
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


let lastUpdate = Date.now();

function init() {
    reshapeit();
    window.requestAnimationFrame(drawit);
}

function drawit() {
    let now = Date.now();
    let deltaTime = now - lastUpdate;
    if ( deltaTime > 10 ) {
        controller.update(deltaTime,now)
        reportFPS();
        physics(deltaTime,now);

        context.save();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "rgba(0,200,0,1)";
        context.fillRect(MAX_SIZE*x, MAX_SIZE*y, MAX_SIZE*size, MAX_SIZE*size);
        context.restore();
        lastUpdate = now;

    }
    window.requestAnimationFrame(drawit);
}

function physics(deltaTime,now) {
    x = x*.995 + .5*.005;
    y = y*.995 + .5*.005;
}


window.onload = init;

