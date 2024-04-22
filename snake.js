// on document ready
document.addEventListener('DOMContentLoaded', function () {

    // get the current time in milliseconds
    let start_time_ms = new Date().getTime();
    const resetStartTime = ()=>start_time_ms = new Date().getTime();
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
    let snake, food, direction, size, gameover;
    let totalSteps = 0;
    let maxsize = 0;
    let deaths = 0;
    
    // Function to generate a random food position
    function generateFood() {
        let x = Math.floor(Math.random() * 21)+2;
        let y = Math.floor(Math.random() * 21)+2;
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
        updateFPS();
        resetStartTime();
    }
    
    // main game interval
    let game_interval = null;
    function updateFPS() {
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
        for (let i = 0; i < snake.length; i++) {
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
        let newX = snake[0].x + direction.x;
        let newY = snake[0].y + direction.y;
        snake.unshift({ x: newX, y: newY });
        return { newX, newY };
    }

    // Function to check for collision with food
    function checkFoodCollision(newX, newY) {
        if (food && food.x === newX && food.y === newY) {
            size++;
            generateFood();
            updateFPS();
            return true;
        }
        return false;
    }

    // Function to check for collision with self
    function checkSelfCollision(newX, newY) {
        if (direction.x !== 0 || direction.y !== 0) {
            for (let i = 1; i < snake.length; i++) {
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

    // Increment deaths
    function incrementDeaths() {
        deaths++;
        document.getElementById('deathcount').innerText = deaths;
        // remove the class `hidden` from the element
        document.getElementById('deathcount').parentElement.classList.remove('hidden');
        shake('deathcount');
    }

    // Function to update the game state
    function update() {
        const { newX, newY } = moveSnake();

        if (!checkFoodCollision(newX, newY)) {
            snake.pop();
        }

        let collision = checkSelfCollision(newX, newY) || checkWallCollision(newX, newY);

        if (collision) {
            incrementDeaths();
            gameover = true;
            return;
        } else {
            updateStepsAndSize();
            showSecondaryElements();
        }
    }

    function shake(elementid) {
        let element = document.getElementById(elementid).parentElement;
        element.classList.remove('shake');
        element.offsetWidth;
        element.classList.add('shake');
    }

    // Function to update steps and size
    function updateStepsAndSize() {
        if (direction.x !== 0 || direction.y !== 0) {
            document.getElementById('totalsteps').innerText = totalSteps++;
            if (((totalSteps < 100) && (totalSteps % 10 === 0))||(totalSteps % 100 === 0)){
                shake('totalsteps')
            }
        }

        if (size > maxsize) {
            maxsize = size;
            document.getElementById('maxsize').innerText = maxsize;
            if (maxsize % 2 === 0) {
                shake('maxsize')
            }
        }
    }

    // Function to show secondary elements
    function showSecondaryElements() {
        if (size >= 4) {
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