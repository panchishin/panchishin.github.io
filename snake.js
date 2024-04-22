// on document ready
document.addEventListener('DOMContentLoaded', function () {

    // get the current time in milliseconds
    const start_time_ms = new Date().getTime();
    const getElapsedTime = ()=>(new Date().getTime() - start_time_ms);
    
    // Get the canvas element
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    
    // Set the canvas dimensions
    canvas.width = 500;
    canvas.height = 500;
    
    // Calculate the pixel size
    let pixelSize = Math.min(canvas.width, canvas.height) / 25;
    
    // Initialize the game state
    var snake, food, direction, size, gameover;
    var totalSteps = 0;
    var maxsize = 0;
    
    // Function to generate a random food position
    function generateFood() {
        var x = Math.floor(Math.random() * 21)+2;
        var y = Math.floor(Math.random() * 21)+2;
        food = { x: x, y: y };
    }
    
    function initializeGameState() {
        // Initialize the game state
        snake = [
            { x: 12, y: 12 },
            { x: 12, y: 12 },
            { x: 12, y: 12 }
        ];
        gameover = false;
        direction = { x: 0, y: 0 };
        size = 3;
        generateFood();
        set_interval();
    }
    
    // main game interval
    let game_interval = null;
    function set_interval() {
        if (game_interval) clearInterval(game_interval);
        game_interval = setInterval(function () {
            if (!gameover) update();
            draw();
        }, Math.max(75, 250-size*5));
    }
    
    function fillText(text, x, y, color) {
        ctx.fillStyle = 'lightgray';
        ctx.fillText(text, x-2, y-2);
        ctx.fillStyle = 'lightgray';
        ctx.fillText(text, x+2, y+2);
        ctx.fillStyle = 'lightgray';
        ctx.fillText(text, x+2, y-2);
        ctx.fillStyle = 'lightgray';
        ctx.fillText(text, x-2, y+2);
        ctx.fillStyle = 'black';
        ctx.fillText(text, x, y);
    }
    
    // Function to draw the game state
    function draw() {
        ctx.fillStyle = 'lightgray';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        for (var i = 0; i < snake.length; i++) {
            ctx.fillRect(snake[i].x * pixelSize, snake[i].y * pixelSize, pixelSize, pixelSize);
        }
        if (food) {
            ctx.fillStyle = 'green';
            ctx.fillRect(food.x * pixelSize, food.y * pixelSize, pixelSize, pixelSize);
        }
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        if (direction.x !== 0 || direction.y !== 0) {
            ctx.font = '24px Arial';
            fillText('Size: ' + size, 10, 10, 'white');
        }
        if (getElapsedTime() < 5000) {
            ctx.font = '18px Arial';
            fillText('Use wasd to move', 10, 40, 'lightgray');
        }
        if (gameover) {
            ctx.font = '48px Arial';
            fillText('Dead Snake', 100, 100, 'white');
            ctx.font = '24px Arial';
            fillText("press 'r' to respawn", 130, 150, 'lightgray');
        }
    }
    
// Function to move the snake
function moveSnake() {
    var newX = snake[0].x + direction.x;
    var newY = snake[0].y + direction.y;
    snake.unshift({ x: newX, y: newY });
    return { newX, newY };
}

// Function to check for collision with food
function checkFoodCollision(newX, newY) {
    if (food && food.x === newX && food.y === newY) {
        size++;
        generateFood();
        set_interval();
        return true;
    }
    return false;
}

// Function to check for collision with self
function checkSelfCollision(newX, newY) {
    if (direction.x !== 0 || direction.y !== 0) {
        for (var i = 1; i < snake.length; i++) {
            if (snake[i].x === newX && snake[i].y === newY) {
                return true;
            }
        }
    }
    return false;
}

// Function to check for collision with walls
function checkWallCollision(newX, newY) {
    if (newX < 0 || newX >= 25 || newY < 0 || newY >= 25) {
        return true;
    }
    return false;
}

// Function to update the game state
function update() {
    const { newX, newY } = moveSnake();

    if (!checkFoodCollision(newX, newY)) {
        snake.pop();
    }

    let collision = checkSelfCollision(newX, newY) || checkWallCollision(newX, newY);

    if (collision) {
        gameover = true;
        return;
    } else {
        updateStepsAndSize();
        showSecondaryElements();
    }
}

// Function to update steps and size
function updateStepsAndSize() {
    document.getElementById('totalsteps').innerText = totalSteps++;
    if (totalSteps % 10 === 0) document.getElementById('totalsteps').parentElement.classList.add('shake');

    if (size > maxsize) {
        maxsize = size;
        document.getElementById('maxsize').innerText = maxsize;
        document.getElementById('maxsize').parentElement.classList.add('shake');
    }
}

// Function to show secondary elements
function showSecondaryElements() {
    if (size >= 5) {
        document.querySelectorAll('.secondary').forEach((element) => {
            element.classList.remove('hidden');
        });
    }
}
    
    // Function to handle key presses
    function handleKeyPress(event) {
        switch (event.key) {
            case 'w': case 'ArrowUp':
                direction = { x: 0, y: -1 };
                break;
            case 'a': case 'ArrowLeft':
                direction = { x: -1, y: 0 };
                break;
            case 's': case 'ArrowDown':
                direction = { x: 0, y: 1 };
                break;
            case 'd': case 'ArrowRight':
                direction = { x: 1, y: 0 };
                break;
            case 'r':
                initializeGameState()
                break;
        }
        console.log(direction);
    }
    
    
    
    // Initialize the game
    initializeGameState();
    
    // Add event listener for key presses
    document.addEventListener('keydown', handleKeyPress);
    
    
});