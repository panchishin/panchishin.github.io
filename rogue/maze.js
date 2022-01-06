const WALL = "▓";
const SPACE = " ";
const DOOR = "╪";
const HERO = "@";
const STEPS = ".";
const CHAMBER = ",";
const EXIT = "E";
const COIN = "c";
const SLUG = "~";


let start_i = 0;
let start_j = 0;
let light = true;
let footprints = true;
let canMove = false;
let known;
let mazeSize = 3;
let numChambers = 0;
let numDoors = 0;
let g;
let tunnelVision = 1;

let totalSteps = 0;
let totalExits = 0;
let totalMaps = 0;
let secondsPlayed = 0;
let achievements = [];
let messages = [];
let enteredAChamber = false;
let coins = 0;
let slugs = 0;
let inventoryCoins = 0;
let killsSlugs = 0;
let deaths = 0;

const MAX_MAZE_SIZE = 13;
const MAX_DOORS = 2;
const MAX_CHAMBERS = 10;
const MAX_GOOD_THINGS = 3;
const MAX_BAD_THINGS = 3;

function addMessage(message, cssclass=null) {
	messages.unshift(message)
	let span = document.createElement("span");
	span.innerHTML = message;
	if (cssclass != null) span.classList.add(cssclass)
	let div = document.createElement("div")
	div.appendChild(span)
	let log = document.getElementById("messagelog");
	log.insertBefore(div, log.firstChild);
	if (document.getElementById("messagelog").children.length > 15) {
		document.getElementById("messagelog").lastChild.remove();
	}
}

function addAchievement(message) {
	addMessage("Achievement : " + message + "!", "achievements");
	achievements.unshift(message);
	updateStat("achievements",achievements.length,achievements.length>0);
}

function updateStat(statName, statValue, display) {
	if (display) {
		document.getElementById(statName).parentElement.classList.remove("hidden");
	}
	document.getElementById(statName).innerHTML = statValue;
}

function upgrade() {
	if (numChambers < mazeSize - 5) {
		numChambers += 1;
		if (numChambers == 1) {
			addMessage("Dungeons can now have a chamber.");
		} else {
			addMessage("Dungeons now have " + numChambers + " chambers.");
		}
		return
	}
	if (numChambers >= 1 && numDoors == 0) {
		numDoors = 1;
		addMessage("Chambers can now have a door (marked with a '"+DOOR+"').");
		return;
	} 
	if (numChambers >= 3 && numDoors == 1) {
		numDoors = 2;
		addMessage("Chambers can now have 2 doors.");
		return;
	}
	if (mazeSize >= 7 && light) {
		light = false;
		addAchievement("Light is too easy. Exploration illuminates the dungeon");
		return;
	}
	if (coins < mazeSize - 4 && coins < MAX_GOOD_THINGS) {
		coins += 1;
		if (coins == 1) {
			addAchievement("Unlocked Coins "+COIN)
			addMessage("Coins may be laying about.");
		} else {
			addMessage("More coins to find.");
		}
		return
	}
	if (slugs < coins && slugs < MAX_BAD_THINGS) {
		slugs += 1;
		if (slugs == 1) {
			addAchievement("Unlocked Slugs "+SLUG)
			addMessage("Slugs "+SLUG+" may be lurking about.");
		} else {
			addMessage("More slugs.");
		}
		return
	}
	if (mazeSize < MAX_MAZE_SIZE) {
		mazeSize += 1;
		addMessage("Dungeons have grown to size " + (mazeSize*2+1) + ".");
		return;
	}
}

// for (let x=0; x<50; x++) upgrade();

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
		for(let x=0 ; x<100 ; x++) {
			let I = randint(1,n-2);
			let J = randint(1,n-2);
			I += I%2==0 ? 1 : 0;
			J += J%2==0 ? 1 : 0;
			if (G[I][J] == legalTile) return [I,J];
		}
		throw("This shouldn't happen");
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

	// place coins
	for (let x=0; x<coins; x++) {
		[I, J] = placeItem(SPACE, true)
		console.log("placing coin " + I + " " + J);
		G[I][J] = COIN;
	}
	// place slugs
	for (let x=0; x<slugs; x++) {
		[I, J] = placeItem(SPACE, true)
		console.log("placing slug " + I + " " + J);
		G[I][J] = SLUG;
	}
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
	updateStat("maze",text.join("\n"),true);
}

function start(){
	totalMaps++
	updateStat("totalmaps",totalMaps,true);
	updateStat("mazesize",mazeSize>=MAX_MAZE_SIZE?"max":mazeSize*2+1,mazeSize>5);
	updateStat("numchambers",numChambers,numChambers > 0);
	updateStat("numdoors",numDoors,numChambers > 1);

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
		if (totalSteps == 1) addAchievement("You discovered how to walk");
		if (totalSteps == 100) addAchievement("100 steps");
		if (totalSteps == 250) addAchievement("250 steps");

		updateStat("totalsteps",totalSteps,totalSteps>0);
		if (g[start_i][start_j] == SPACE && footprints) {
			g[start_i][start_j] = STEPS;
		}
		if (g[start_i][start_j] != CHAMBER && g[i][j] == CHAMBER) {
			if (!enteredAChamber) {
				addAchievement("Explored first chamber")
				enteredAChamber = true;
			}
			document.getElementById("maze").classList.add("danger");
		}
		if (g[start_i][start_j] == CHAMBER && g[i][j] != CHAMBER) {
			document.getElementById("maze").classList.remove("danger");
		}
		[start_i,start_j] = [i,j]

		if (g[start_i][start_j] == COIN) {
			inventoryCoins++;
			g[start_i][start_j] = STEPS;
			updateStat("inventoryCoins",inventoryCoins,true)
			if (coins == 1) addAchievement("Coins");
		}

		if (g[start_i][start_j] == SLUG) {
			if (randint(1,6)==6) {
				// adventurer death
				if (inventoryCoins>0){
					inventoryCoins = 0;
					updateStat("inventoryCoins",inventoryCoins,true);
				}
				deaths++;
				updateStat("deaths",deaths,true);
				addMessage("Death");
				mazeSize = Math.max(5,mazeSize-1);
				slugs = Math.max(0,slugs-1);
				coins = Math.max(0,coins-1);
				numChambers = 0;
				tunnelVisionIn(start);
			} else {
				// slug death
				killsSlugs++;
				if (killsSlugs == 1) addAchievement("First slug kill");
				else if (killsSlugs == 5) addAchievement("Fifth slug kill");
				else if (killsSlugs == 10) addAchievement("Tenth slug kill");
				else addMessage("The dungeon slug as been squished");
				g[start_i][start_j] = STEPS;
				updateStat("killsSlugs",killsSlugs,true);
			}
		}

		if (g[start_i][start_j] == EXIT) {
			totalExits++;
			if (totalExits == 1) addAchievement("First exit found")
			updateStat("totalexits",totalExits,totalExits>0);
			upgrade();
			tunnelVisionIn(start);
		}
	}
}

function tunnelVisionIn(callback) {
	canMove = false;
	document.getElementById("maze").classList.add("paused");
	tunnelVision = Math.floor(g.length);
	function zoom() {
		if (tunnelVision > 1) {
			tunnelVision *= 0.8;
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
			tunnelVision *= 1.2;
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
    },
	'KeyL' : { funct: function() { light = !light; }
    },
	'KeyU' : { funct: function() { if (canMove) {
		if (mazeSize < 7) { addMessage("You found the Upgrade cheat!") }
		upgrade(); start();
	} } }
};

document.onkeydown = (e) => {
	if (canMove) {
		if (e.code in actions) {
			actions[e.code].funct();
			refresh();
		}
	}
};

// prevent window from scrolling when using the arrow functions
window.addEventListener("keydown", function(e) {
    if (e.code in actions) {
        e.preventDefault();
    }
}, false);

function incrementTimer() {
	secondsPlayed++;
	if (secondsPlayed == 120) document.getElementById("secondsplayed").parentElement.classList.remove("hidden");
	if (secondsPlayed == 10) addMessage("10 seconds have passed since you began.");
	if (secondsPlayed == 60) addMessage("Wow, you've been playing for 1 minute");
	if (secondsPlayed == 60*5) addMessage("It's been 5 minutes and you are still here?");
	if (secondsPlayed == 60*10) addAchievement("10 min of game time");
	if (secondsPlayed == 60*30) addAchievement("30 min of game time");
	if (secondsPlayed == 60*60) addAchievement("60 min of game time");

	document.getElementById("secondsplayed").innerHTML = secondsPlayed;
}

setInterval(incrementTimer,1000);