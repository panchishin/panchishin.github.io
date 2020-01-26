const canvas = document.getElementById("canvas");

const context = canvas.getContext('2d');


let MAX_SIZE = 0;
let MAX_FOOD = 100 / sizeScale;
let FOOD_VALUE = 20;

let x = .5;
let y = .5;
let size = .02;
let move = .01;

let bots = [];
let foods = [];

let cameraX = 0;
let cameraY = 0;


function triangle(){ return (Math.random()-.5)*(Math.random()-.5)*.75 }

function addFood(center) {
    if (center == 0) {
        foods.push( new Food( .25+triangle(), .25+triangle() ) )
    }
    if (center == 1) {
        foods.push( new Food( .75+triangle(), .75+triangle() ) )   
    }
    if (center == 2) {
        foods.push( new Food( Math.random(), Math.random() ) )
    }
}

for(let c=0; c<360; c+=60){ let b = RandomBot(c); bots.push(b); bots.push(b.spawn()) }


let lastDraw = 0;
let lastAddFood = 0;

let startTime = Date.now()/1000;

function draw() {
    let now = Date.now()/1000;
    let season = Math.sin((now-startTime)*2*Math.PI/20);
    if (season > -.2) {
        if ( lastAddFood + .005 < now ) {
            if ( foods.length < MAX_FOOD ) {
                addFood(Math.floor(Math.random()*2));
            }
            lastAddFood = now
        }
    } else if (season > -.5) {
        if ( lastAddFood + .02 < now ) {
            addFood(2)
            lastAddFood = now
        }
    }
    let deltaSeconds = now - lastDraw;
    if ( lastDraw == 0 ) {
        lastDraw = now;
    } else if ( deltaSeconds > .01 ) {
        // controller.update(deltaSeconds,now)
        /*let diversityCount = Object.keys(bots.map(function(bot){ return Math.round(bot.color / 5)*5 }).reduce(function(s,n){ s[n]=s[n]?s[n]+1:1; return s },{})).length;
        if (diversityCount < 10) {
            console.log("Low diversity, adding bot")
            addBot()
        }*/
        physics(deltaSeconds,now);
        context.clearRect(0, 0, canvas.width, canvas.height);
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
                bots[bi].eat(FOOD_VALUE)
            }
        }
        bots[bi].decision(foods, deltaSeconds)
    }

    for(let bi=bots.length-1 ; bi>=0 ; bi--) {
        if (!bots[bi].isAlive()) {
            bots.splice(bi,1)
        }
    }
    for(let bi=bots.length-1 ; bi>=0 ; bi--) {
        if (bots[bi].canSpawn()){
            bots.push(bots[bi].spawn())
        }
    }
    /*for(let fo=foods.length-1 ; fo>=0 ; fo--) {
        if (!foods[fo].useful()) {
            foods.splice(fo,1)
        }
    }*/   

}


function reshapeCanvas(size) {
    MAX_SIZE = size || Math.min(window.innerWidth - 22,window.innerHeight - 22);
    canvas.width = MAX_SIZE;
    canvas.height = MAX_SIZE;
}


function init() {
    reshapeCanvas();
    window.requestAnimationFrame(draw);
}


window.onload = init;
