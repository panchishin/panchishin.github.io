const WALL = "#";
const SPACE = " ";
const DOOR = "D";
const HERO = "@";
const STEPS = ".";
const EXIT = "E";

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

let start_i = 0;
let start_j = 0;

function maze(n, chambers=0, doors=0) {
	n = n*2+1

	assert(n > 3 && n%2 == 1);

	var G = Array(n);
	for (var i = 0; i < n; i++) G[i] = Array(n).fill(WALL);

	function placeChamber() {
		let I = randint(1,n-6);
		let J = randint(1,n-6);
		I += I%2==0 ? 1 : 0;
		J += J%2==0 ? 1 : 0;

		for(let i=0; i<5; i++) for(let j=0; j<5; j++) G[I+i][J+j] = SPACE;

		for(let door=0; door<doors; door++) {
			[i,j] = [randint(0,1)*6-1 , randint(0,2)*2];
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

	return G;
}

let mazeSize = 3;
let numChambers = 0;
let numDoors = 0;
let g;

function refresh(){
	let n = g.length;
	let text = [];
	for (let i=0; i<n; i++) {
		let line = []
		for (let j=0; j<n; j++) {
			if (i==start_i && j==start_j) line.push(HERO);
			else line.push( g[i][j] );
		}
		text.push(line.join(" "));
	}
	document.getElementById("maze").innerHTML = text.join("\n");
}

function start(){
	g = maze(mazeSize, numChambers, numDoors);
	refresh();
};

function regenerate() {start()}
function increaseMaze() {mazeSize++; start()}
function increaseChambers() {numChambers = Math.max(0,Math.min(Math.floor(mazeSize/2-2),numChambers+1)); start()}
function increaseDoors() {numDoors = Math.min(3,numDoors+1); start()}

function moveTo(i,j) {
	if (0<=i && i<g.length && 0<=j && j<g.length && g[i][j] != WALL) {
		if (g[i][j] == SPACE) g[i][j] = STEPS;
		[start_i,start_j] = [i,j]
	}
}

let actions = {
    default : { desc : 'default', 
		funct : function(){ } 
	},
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
    },
};

document.onkeyup = (e) => {
    let action = (e.code in actions) ? e.code : "default";
    actions[action].funct();
	refresh();
};
