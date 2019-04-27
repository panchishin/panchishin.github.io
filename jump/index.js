
let canvas = document.getElementById("canvas");
let context = canvas.getContext('2d');
let jump_power_element = document.getElementById('jumppower');


let reportFPS = function(element_id){
    let fps_element = document.getElementById(element_id);
    let requests = 0;
    let lastTime = Date.now();
    let clock = 0;
    return function(){
      let thisTime = Date.now();
      requests += 1
      if (thisTime - lastTime >= 500) {
          let rate = 1000*requests/(thisTime - lastTime);
          clock = (clock+1)%4;
          fps_element.innerHTML = Math.round( rate ) + " " + (clock==0?"/":(clock==1?"-":(clock==2?"\\":"|"))) ;
          requests = 0;
          lastTime = thisTime;
      }
    }
}("fps");


let MAX_X = 0;
let MAX_Y = 0;

let RUN_SPEEDUP = 0.1;
let RUN_MAX_SPEED = 10;
let VERTICAL_DRAG = 1.0;
let HORIZONTAL_DRAG = .995;
let MAX_JUMP_SPEED = -8;
let JUMP_SPEED = -8;
let JUMP_SPEED_FATIGUE = 0.8;
let NEXT_JUMP_COOLDOWN = 1200;
let MAX_JUMPS = 1;
let STOP_DRAG = 0.985;
let STOP_DROP = 0.1;
let BOX_SIZE = 20;
let WALL_BOUNCE = -.2;
let WALL_BOUNCE_TIME = 200;


let reportJumpPower = function() {
    if( (jumps < MAX_JUMPS)&&(nextJumpTime < Date.now() ) ){ 
        JUMP_SPEED = MAX_JUMP_SPEED
    }
    jump_power_element.innerHTML = Math.round( JUMP_SPEED/MAX_JUMP_SPEED * 100 );
}

function reshapeit() {
    canvas.width = window.innerWidth - 22;
    canvas.height = window.innerHeight - 122;
    MAX_X = canvas.width - BOX_SIZE;
    MAX_Y = canvas.height - BOX_SIZE;
    x = MAX_X / 2;
    y = MAX_Y / 2;
}

let actions = {
    default : { desc : 'default', funct : function(keyCode,deltaTime){ } },
    '37' : { desc : 'left' , 
        funct : function(keyCode,deltaTime) {
            if ( nextLeftTime < Date.now() ) {
                dx -= deltaTime*RUN_SPEEDUP ; dx = Math.max(-1*RUN_MAX_SPEED,dx) 
            }
        }
    },
    '39' : { desc : 'right' , 
        funct : function(keyCode,deltaTime) { 
            if ( nextRightTime < Date.now() ) {
                dx += deltaTime*RUN_SPEEDUP ; dx = Math.min(RUN_MAX_SPEED,dx) 
            }
        }
    },
    '38' : { desc : 'up' , 
        funct : function(keyCode,deltaTime) { 
            if( (jumps < MAX_JUMPS)&&(nextJumpTime < Date.now() ) ){ 
                nextJumpTime = Date.now() + NEXT_JUMP_COOLDOWN; 
                JUMP_SPEED = MAX_JUMP_SPEED
                jumps += 1; dy = JUMP_SPEED ; 
            }else if(jumps < MAX_JUMPS) {
                JUMP_SPEED *= JUMP_SPEED_FATIGUE
                jumps += 1; dy = JUMP_SPEED ; 
                nextJumpTime = Date.now() + NEXT_JUMP_COOLDOWN * ( .2 + JUMP_SPEED / MAX_JUMP_SPEED );
            }
        }
    },
    '40' : { desc : 'down' , 
        funct : function(keyCode,deltaTime) { 
            dx *= Math.pow(STOP_DRAG,deltaTime) ; 
            dy += STOP_DROP*deltaTime 
        }
    },
};

Object.keys(actions).forEach(function(key) {
    let action = actions[key];
    if (!('funct' in action)) {
        action['funct'] = function(){ }
    }
});

function doAction(keyCode,deltaTime){
    let action = "" + keyCode;
    action = (action in actions) ? action : "default";
    actions[action].funct(keyCode,deltaTime);
}


let x = 0;
let y = 0;
let dy = 0;
let dx = 0;
let jumps = 0;
let nextJumpTime = 0;
let nextLeftTime = 0;
let nextRightTime = 0;
let keyCodeDown = {};

let lastUpdate = Date.now();

function init() {
    reshapeit();
    window.requestAnimationFrame(drawit);
}

function drawit() {
    let now = Date.now();
    let deltaTime = now - lastUpdate;
    if ( deltaTime > 10 ) {
        reportFPS();
        reportJumpPower();
        physics(deltaTime,now);
        context.save();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "rgba(0,200,0,1)";
        context.fillRect(x, y, BOX_SIZE, BOX_SIZE);
        context.restore();
        lastUpdate = now;
    }
    window.requestAnimationFrame(drawit);
}

function physics(deltaTime,now) {

    Object.keys(keyCodeDown)
        .filter(function(key){ return keyCodeDown[key] <= now })
        .forEach(function(key){ delete keyCodeDown[key] });

    Object.keys(keyCodeDown)
        .forEach(function(key){
            doAction(key,deltaTime)
        })


    dy += deltaTime * 0.02;
    dy *= Math.pow(VERTICAL_DRAG, deltaTime);
    y += dy;

    x += dx;
    dx *= Math.pow(HORIZONTAL_DRAG,deltaTime);
    if ( y >= MAX_Y ) {
        y = MAX_Y;
        dy = 0;
        jumps = 0;
    }
    if ( y <= 0 ) {
        y = 0;
        dy = 0;
    }
    if ( x > MAX_X ) {
        dx *= WALL_BOUNCE;
        x = MAX_X;
        nextRightTime = Date.now() + WALL_BOUNCE_TIME;
        jumps = 0;
    }
    if ( x < 0 ) {
        dx *= WALL_BOUNCE;
        x = 0;
        nextLeftTime = Date.now() + WALL_BOUNCE_TIME;
        jumps = 0;
    }
}


window.onload = init;

window.addEventListener('keydown', 
    function(event) { keyCodeDown[event.keyCode] = Date.now() + 60*1000; },
    false
);
window.addEventListener('keyup', 
    function(event) {delete keyCodeDown[event.keyCode];},
    false
);
