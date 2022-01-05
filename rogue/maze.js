const WALL = "#";
const SPACE = " ";
const DOOR = "D";
const HERO = "@";
const STEPS = ".";
const CHAMBER = ",";
const EXIT = "E";


let start_i = 0;
let start_j = 0;
let light = true;
let footprints = true;
let canMove = false;
let known;
let mazeSize = 3;
let numChambers = 0;
let numDoors = 1;
let g;
let tunnelVision = 1;

let totalSteps = 0;
let totalExits = 0;
let totalMaps = 0;

const MAX_MAZE_SIZE = 13;
const MAX_DOORS = 2;
const MAX_CHAMBERS = 10;

function addMessage(message) {
	let span = document.createElement("span");
	span.innerHTML = message;
	let div = document.createElement("div")
	div.appendChild(span)
	let log = document.getElementById("messagelog");
	log.insertBefore(div, log.firstChild);
}

function upgrade() {
	if (numChambers < mazeSize - 5) {
		numChambers += 1;
		if (numChambers == 1) addMessage("Dungeons can have a chamber");
		if (numChambers > 1) addMessage("Dungeons can have " + numChambers + " chambers");
		return
	}
	if (numChambers >= 3 && numDoors == 1) {
		numDoors = 2;
		addMessage("Chambers can now have 2 doors");
		return;
	} 
	if (mazeSize >= 7 && light) {
		light = false;
		addMessage("Light is scarce");
		return;
	}
	if (mazeSize < MAX_MAZE_SIZE) {
		mazeSize += 2;
		addMessage("Dungeons have grown to size " + (mazeSize*2+1));
		return;
	}
}

// for (let x=0; x<5; x++) upgrade();

function randint(lowerbound,upperbound) {
	return Math.floor(Math.random() * (upperbound-lowerbound+1)) + lowerbound;
}

function shuffle(array) {
	let currentIndex = array.length,  randomIndex;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}

function assert(statement) {
	if (!statement) {
		var err = new Error();
    	console.log(err.stack);
		throw "Wrong!";
	}
}

function illuminate(g, focus_i, focus_j, distance=3){
	let n = g.length;
	for (let i=-distance; i<=distance; i++) {
		for (let j=-distance; j<=distance; j++) {
			if (i*i + j*j <= distance*distance) {
				let I;
				let J;
				[I,J] = [focus_i+i, focus_j+j];
				if (0<=I && I<n && 0<=J && J<n) {
					known[I][J] = true;
				}
			}
		}
	}
}

function maze(n, chambers=0, doors=0) {
	n = n*2+1

	assert(n > 3 && n%2 == 1);

	var G = Array(n);
	for (var i = 0; i < n; i++) G[i] = Array(n).fill(WALL);

	known = Array(n);
	for (var i = 0; i < n; i++) known[i] = Array(n).fill(false);


	function placeChamber() {
		const size = 3;
		let I = randint(1,n-size-1);
		let J = randint(1,n-size-1);
		I += I%2==0 ? 1 : 0;
		J += J%2==0 ? 1 : 0;

		for(let i=0; i<size; i++) for(let j=0; j<size; j++) G[I+i][J+j] = CHAMBER;
		illuminate(G, I+Math.floor(size/2), J+Math.floor(size/2), size);

		for(let door=0; door<doors; door++) {
			[i,j] = [randint(0,1)*(size+1)-1 , randint(0,Math.floor(size/2))*2];
			if (randint(0,1) == 0) [i,j] = [j,i];
			if (G[I+i][J+j] == WALL) {
				G[I+i][J+j] = DOOR;
			}
		}
	}

	for(let z=0; z<chambers; z++) {
		placeChamber();
	}

	function placeItem(legalTile) {
		while(true) {
			let I = randint(1,n-2);
			let J = randint(1,n-2);
			I += I%2==0 ? 1 : 0;
			J += J%2==0 ? 1 : 0;
			if (G[I][J] == legalTile) return [I,J];
		}
	}

	[start_i, start_j] = placeItem(WALL)
	G[start_i][start_j] = SPACE;

	let tmax = 0;
	let iexit = 0;
	let jexit = 0;

	function DFS(i, j, t){
		let I = 0, J = 0;
		for ( [I, J] of shuffle([[i+2, j], [i-2, j], [i, j+2], [i, j-2]] ) ) {
			if (0 <= I && I < n && 0 <= J && J < n) if ( (G[I][J] == WALL && G[(I+i)/2][(J+j)/2] == WALL) || (I==start_i && J==start_j)) {
				G[I][J] = SPACE;
				G[(I+i)/2][(J+j)/2] = SPACE;
				if (t > tmax && (I!=start_i || J!=start_j) ) { 
					[tmax, iexit, jexit] = [t, I, J];
				}
				if (I!=start_i || J!=start_j) {
					DFS(I, J, t + 1);
				}
			}
		}
	}

	[iexit, jexit, tmax] = [1,1, 0];

	DFS(start_i, start_j, 0);
	G[iexit][jexit] = EXIT;
	illuminate(G, iexit, jexit);

	return G;
}

function refresh(){
	illuminate(g, start_i, start_j);
	let n = g.length;
	let text = [];
	for (let i=0; i<n; i++) {
		let line = []
		for (let j=0; j<n; j++) {
			if ((start_i-i)**2 + (start_j-j)**2 > tunnelVision*tunnelVision) {
				line.push( "?" );
			} else if (i==start_i && j==start_j) {
				line.push(HERO);
			} else if (light || known[i][j]) {
				line.push( g[i][j] );
			} else {
				line.push( " " );
			}
		}
		text.push(line.join(""));
	}
	document.getElementById("maze").innerHTML = text.join("\n");
}

function start(){
	totalMaps++
	document.getElementById("totalmaps").innerHTML = totalMaps;

	g = maze(mazeSize, numChambers, numDoors);

	for (let i=g.length; i>0; i--) {
		let row = []
		for (let j=g.length; j>0; j--) {
			row.push(false);
		}
		known.push(row)
	}
	document.getElementById("maze").classList.remove("danger");
	tunnelVisionOut(refresh);
};

document.getElementsByClassName("runsimulation")[0].onclick = () => {
	if (canMove) { tunnelVisionIn(start) }
}


function moveTo(i,j) {
	if (0<=i && i<g.length && 0<=j && j<g.length && g[i][j] != WALL) {
		totalSteps++;
		document.getElementById("totalsteps").innerHTML = totalSteps;
		if (g[start_i][start_j] == SPACE && footprints) {
			g[start_i][start_j] = STEPS;
		}
		if (g[start_i][start_j] != CHAMBER && g[i][j] == CHAMBER) {
			document.getElementById("maze").classList.add("danger");
		}
		if (g[start_i][start_j] == CHAMBER && g[i][j] != CHAMBER) {
			document.getElementById("maze").classList.remove("danger");
		}
		[start_i,start_j] = [i,j]
		if (g[start_i][start_j] == EXIT) {
			totalExits++;
			document.getElementById("totalexits").innerHTML = totalExits;
			upgrade();
			tunnelVisionIn(start);
		}
	}
}

function tunnelVisionIn(callback) {
	canMove = false;
	document.getElementById("maze").classList.add("paused");
	tunnelVision = Math.floor(g.length/2);
	function zoom() {
		if (tunnelVision > 1) {
			tunnelVision -= 1;
			refresh();
			setTimeout(zoom, 100);
		} else {
			callback()
		}
	}
	zoom();
}

function tunnelVisionOut(callback) {
	maxTunnelVision = Math.floor(g.length);
	tunnelVision = 0
	function zoom() {
		if (tunnelVision < maxTunnelVision) {
			tunnelVision += 1;
			refresh();
			setTimeout(zoom, 100);
		} else {
			tunnelVision = g.length*2;
			canMove = true;
			document.getElementById("maze").classList.remove("paused");
			callback()
		}
	}
	zoom();
}

let actions = {
    'ArrowLeft' : { desc : 'left' , 
        funct : function() {
			moveTo(start_i,start_j-1);
        }
    },
    'ArrowRight' : { desc : 'right' , 
        funct : function() { 
			moveTo(start_i,start_j+1);
        }
    },
    'ArrowUp' : { desc : 'up' , 
        funct : function() { 
			moveTo(start_i-1,start_j);
        }
    },
    'ArrowDown' : { desc : 'down' , 
        funct : function() { 
			moveTo(start_i+1,start_j);
        }
    }
};

document.onkeydown = (e) => {
	if (canMove) {
		if (e.code in actions) {
			actions[e.code].funct();
			refresh();
		}
	}
};
