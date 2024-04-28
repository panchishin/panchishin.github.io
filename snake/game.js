'use strict';

export function SnakeGame(ui) {

    // Get the canvas element
    ui.setGame(this);
    this.ui = ui;
    this.speedmax = 20;
    this.speedstart = 300
    this.speedscaling = 1.2;

    this.resetStartTime = function() { this.start_time_ms = new Date().getTime(); };
    this.resetStartTime();

    this.getElapsedTime = function() { return (new Date().getTime() - this.start_time_ms); };

    this.reset = function() {
        this.resetStartTime();

        this.food = 0;
        this.totalsteps = 0;
        this.maxsize = 0;
        this.deaths = 0;
        this.achievements = 0;
        this.greenapples = 0;
        this.hunger = 0;
        this.gameinterval = null;
        this.speedmax = 20;
        this.speedstart = 300
        this.speedscaling = 1.2;
    };
    this.reset();

    this.generateFood = function() {
        let x = Math.floor(Math.random() * 21)+2;
        let y = Math.floor(Math.random() * 21)+2;
        this.food = { x: x, y: y };
    };

    // Function to move the snake
    this.moveSnake = function() {
        let newX = this.snake[0].x + this.direction.x;
        let newY = this.snake[0].y + this.direction.y;
        this.snake.unshift({ x: newX, y: newY });
        return { newX, newY };
    };

    this.checkFoodCollision = function(newX, newY) {
        if (this.food && this.food.x === newX && this.food.y === newY) {
            this.size++;
            this.movessincelastfood = 0;
            this.generateFood();
            this.updateFPS();
            this.greenapples++;
            if (this.greenapples == 1) {
                this.addMessage('You ate a green apple');
            }
            if (this.greenapples == 10) {
                this.addMessage('You\'ve eaten a few apples, congratulations.  You are a true master of the apple eating arts (no achievment)');
            }

            // TODO change this to a callback notification for the UI to handle
            document.getElementById('greenapples').innerText = this.greenapples;
            if (this.greenapples > 5) document.getElementById('greenapples').parentElement.classList.remove('hidden');
            if (this.greenapples % 10 == 0) this.shake('greenapples');

            return true;
        } else {
            this.movessincelastfood++;
            if (this.movessincelastfood % 100 == 0) {
                this.hunger++;
                if (this.hunger == 1) {
                    this.addMessage('You are hungry');
                }
                if (this.hunger == 5) {
                    this.addMessage('You are very hungry');
                }

                // TODO change this to a callback notification for the UI to handle
                document.getElementById('hunger').innerText = this.hunger;
                document.getElementById('hunger').parentElement.classList.remove('hidden');
                this.shake('hunger');
            }
            return false;
        }
    };

    this.checkSelfCollision = function(newX, newY) {
        if (this.direction.x !== 0 || this.direction.y !== 0) {
            for (let i = 1; i < this.snake.length; i++) {
                if (this.snake[i].x === newX && this.snake[i].y === newY) {
                    return true;
                }
            }
        }
        return false;
    };

    this.checkWallCollision = function(newX, newY) {
        return newX < 0 || newX >= 25 || newY < 0 || newY >= 25;
    };


    this.addMessage = function(message) {
        this.ui.addMessage(message);
    };

    this.addAchievment = function(message) {
        this.achievements++
        this.ui.addAchievment(message);
    };

    // Increment deaths
    this.incrementDeaths = function() {
        this.deaths++;
        if (this.deaths == 1) {
            this.addMessage('You died');
        }
        if (this.deaths == 5) {
            this.addMessage('You died 5 times.  It would be an achievement if it wasn\'t so sad');
        }
        if (this.deaths == 20) {
            this.addAchievment('Respawn Wonder!  Death seems to be a common theme for you');
        }
        if (this.deaths == 100) {
            this.addAchievment('So Much Respawn!  You are a true master of the art of dying');
        }

        // TODO change this to a callback notification for the UI to handle
        document.getElementById('deathcount').innerText = this.deaths;
        // remove the class `hidden` from the element
        document.getElementById('deathcount').parentElement.classList.remove('hidden');
        this.shake('deathcount');
    };

    // Function to update the game state
    this.updateGameState = function() {
        const { newX, newY } = this.moveSnake();

        if (!this.checkFoodCollision(newX, newY)) {
            this.snake.pop();
        }

        let collision = this.checkSelfCollision(newX, newY) || this.checkWallCollision(newX, newY);

        if (collision) {
            this.incrementDeaths();
            this.gameover = true;
            return;
        } else {
            this.updateStepsAndSize();
            this.showSecondaryElements();
        }
    };

    this.shake = function(elementid) {
        let element = document.getElementById(elementid).parentElement;
        element.classList.remove('shake');
        element.offsetWidth;
        element.classList.add('shake');
    };

    // Function to update steps and size
    this.updateStepsAndSize = function() {
        if (this.direction.x !== 0 || this.direction.y !== 0) {

            // TODO change this to a callback notification for the UI to handle
            document.getElementById('totalsteps').innerText = this.totalsteps++;
            if (this.totalsteps == 100) document.getElementById('totalsteps').parentElement.classList.remove('hidden');
            if (this.totalsteps % 100 === 0) this.shake('totalsteps')
        }

        if (this.size > this.maxsize) {
            this.maxsize = this.size;
            // TODO change this to a callback notification for the UI to handle
            document.getElementById('maxsize').innerText = this.maxsize;
            if (this.maxsize % 5 === 0) {
                document.getElementById('maxsize').parentElement.classList.remove('hidden');
                this.shake('maxsize')
                this.addAchievment("You have reached a max size of " + this.maxsize + "!");
            }
        }
    };

    // Function to show secondary elements
    this.showSecondaryElements = function() {
        if (this.size >= 4) {
            document.querySelectorAll('.secondary').forEach((element) => {
                element.classList.remove('hidden');
            });
        }
    };

    this.initializeGameState = function() {
        // Initialize the game state
        this.snake = [
            { x: 12, y: 12 },
            { x: 12, y: 12 },
            { x: 12, y: 12 }
        ];
        this.gameover = false;
        this.direction = { x: 0, y: 0 };
        this.size = 3;
        this.movessincelastfood = 0;
        this.generateFood();
        this.updateFPS();
        this.resetStartTime();
    };

    // Function to handle key presses
    this.handleKeyPress = function(event) {
        switch (event.key) {
            case 'w': case 'ArrowUp':
                this.direction = { x: 0, y: -1 };
                break;
            case 'a': case 'ArrowLeft':
                this.direction = { x: -1, y: 0 };
                break;
            case 's': case 'ArrowDown':
                this.direction = { x: 0, y: 1 };
                break;
            case 'd': case 'ArrowRight':
                this.direction = { x: 1, y: 0 };
                break;
            case 'r':
                this.initializeGameState()
                break;
        }
    };

    this.stopFPS = function() {
        if (this.gameinterval != null) clearInterval(this.gameinterval);
    };

    this.updateFPS = function() {
        this.stopFPS();
        const that = this;
        this.gameinterval = setInterval(function () {
            if (!that.gameover) {
                that.updateGameState();
            }
            that.ui.draw();
        }, Math.max(this.speedmax, this.speedstart/Math.pow(this.speedscaling,this.size-1)));    
    };

    this.initializeGameState();

}