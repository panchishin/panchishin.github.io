
let showBoidDebug = false;

function flip(x){ return (x+Math.PI)%(Math.PI*2) }
function norm(x){ return (x+Math.PI*2)%(Math.PI*2) }

function RandomBot() {
    return new Bot(Math.random(),   // x
        Math.random(),              // y
        Math.random()*Math.PI*2,    // facing
        Math.random()*.4+.05,       // speed param
        Math.random()*2+1,          // lambda turn
        Math.random()*50+125,       // birth energy
        Math.random()*360,          // color
        Math.random()*0.01+0.015,   // size
        100)                        // energy
}

function Bot(xParam,yParam,facingParam,speedParam,
             lambdaTurn,birthEnergy,color,size,energy) {

    this.x = xParam;
    this.y = yParam;
    this.facing = facingParam; // this.facing 0 is East, pi/2 is North
    this.speed = speedParam;
    this.size = size;
    this.energy = energy;
    this.lambdaTurn = lambdaTurn;
    this.birthEnergy = birthEnergy;
    this.color = ( Math.round(color) + 360 ) % 360;
    this.age = 0;
    this.closestFood = null;

    this.canSpawn = function(){
        return this.energy >(100 * this.size/0.02 + 10) && this.energy >= this.birthEnergy && this.size > 0.005 && this.size < 0.25 ;
    }

    this.spawn = function(){
        this.energy -= 100 * this.size/0.02 + 10;
        let result = new Bot(this.x,
                   this.y,
                   this.facing + Math.PI,
                   this.speed*(.9 + Math.random()*.2),
                   this.lambdaTurn*(.9 + Math.random()*.2),
                   this.birthEnergy*(.9 + Math.random()*.2),
                   this.color + Math.random()*10 - 5,
                   this.size*(.9 + Math.random()*.2),
                   90 * this.size/0.02)

        return result
    }

    this.eat = function(value){
        this.energy += value
    }

    this.isAlive = function() {
        return this.energy >= 0 && this.age < 30;  // 2 min
    }

    this.drawFacing = function(MAX_SIZE,x,y) {
        context.strokeStyle = "rgba(100,100,100,1)";
        let dx = Math.sin(this.facing);
        let dy = Math.cos(this.facing);
        context.beginPath();
        context.moveTo(MAX_SIZE*x,MAX_SIZE*y);
        context.lineTo(MAX_SIZE*(x+dx/10),MAX_SIZE*(y+dy/10));
        context.stroke();
    }

    this.drawToFood = function(MAX_SIZE,x,y,cameraX,cameraY) {
        if (!this.closestFood) {
            return;
        }
        context.strokeStyle = "rgba(100,100,100,1)";
        context.beginPath();
        context.moveTo(MAX_SIZE*x,MAX_SIZE*y);
        let nx = (x + ((this.closestFood.x-cameraX+2)%1))/2
        let ny = (y + ((this.closestFood.y-cameraY+2)%1))/2
        context.lineTo(MAX_SIZE*nx,MAX_SIZE*ny);
        context.stroke();        
    }

    this.drawArea = function(MAX_SIZE,x,y) {
        context.strokeStyle = "rgba(100,100,100,1)";
        context.beginPath();
        context.arc(MAX_SIZE*x,MAX_SIZE*y, MAX_SIZE*this.size, 0, Math.PI * 2, true);
        context.stroke();
    }

    this.drawBody = function(MAX_SIZE,x,y) {
        let brightness = Math.max( 20, Math.min(100,this.energy/2) )
        context.fillStyle = "rgba("+color+",0,0,1)";
        context.fillStyle = "hsla("+this.color+",100%,"+brightness+"%,1)";

        let that = this;
        function rotateX(angle) { return MAX_SIZE*(x+Math.sin(that.facing+angle)*that.size) }
        function rotateY(angle) { return MAX_SIZE*(y+Math.cos(that.facing+angle)*that.size) }
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
        // this.drawToFood(MAX_SIZE,nx,ny,cameraX,cameraY);
        this.drawBody(MAX_SIZE,nx,ny);
    }

    this.physics = function(deltaSeconds) {
        this.energy -= deltaSeconds * (3*this.speed + 3*this.lambdaTurn + 1000*this.size*this.size);
        this.age += deltaSeconds;

        let dx = Math.sin(this.facing);
        let dy = Math.cos(this.facing);
        this.x += dx * this.speed * deltaSeconds;
        this.y += dy * this.speed * deltaSeconds;

        this.x = (this.x+2)%1;
        this.y = (this.y+2)%1;
    }

    this.decision = function(foods, deltaSeconds) {
        if (foods.length == 0){
            return;
        }

        // keep going after the same food
        if (this.closestFood || foods.indexOf(this.closestFood) == -1){
            var that = this
            let closestFood = foods.map(function(food) {
                return [distance(that,food),food]
            }).sort(function(a, b){return a[0] - b[0]});

            this.closestFood = closestFood[0][1];

            this.closestFood.hasFocus();

            // face that food
            let dx = this.closestFood.x - this.x;
            let dy = this.closestFood.y - this.y;

            this.facing = norm(this.facing)
            let new_facing = norm( Math.PI/2 - Math.atan2(dy,dx) )

            if (Math.abs(this.facing - new_facing)>Math.PI) {
                this.facing = flip(this.facing)
                new_facing = flip(new_facing)
                this.facing = new_facing*(deltaSeconds*this.lambdaTurn) + this.facing*(1-deltaSeconds*this.lambdaTurn)
                this.facing = flip(this.facing)
            } else {
                this.facing = new_facing*(deltaSeconds*this.lambdaTurn) + this.facing*(1-deltaSeconds*this.lambdaTurn)
            }
        }

    }

}




function Food(xParam,yParam,sizeParam) {
    this.x = Math.min(1, Math.max(0, xParam || Math.random()));
    this.y = Math.min(1, Math.max(0, yParam || Math.random()))
    this.size = sizeParam || 0.01;
    this.focused = 0

    this.draw = function(MAX_SIZE,cameraX,cameraY) {
        let nx = ((this.x-cameraX+2)%1)
        let ny = ((this.y-cameraY+2)%1)
        context.fillStyle = "rgba(0,200,"+this.focused+",1)";
        context.beginPath();
        context.arc(MAX_SIZE*nx,MAX_SIZE*ny, MAX_SIZE*this.size, 0, Math.PI * 2, true);
        context.fill();    
    }

    this.hasFocus = function() {
        this.focused = 200
    }

    this.physics = function(deltaSeconds) {
        this.focused = Math.max(0, this.focused-deltaSeconds*100)
    }
}


let distance = function(a,b) {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    return Math.sqrt( dx*dx + dy*dy );
}

let collide = function(a,b) {
    return distance(a,b) < Math.max(a.size, b.size) + Math.min(a.size, b.size)/2;
}

