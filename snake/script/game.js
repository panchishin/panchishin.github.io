'use strict';

export function SnakeGame(ui) {

    ui.setGame(this);
    this._ui = ui;

    this.food = 0;
    this.totalsteps = 0;
    this.maxsize = 0;
    this.deaths = 0;
    this.achievements = 0;
    this.greenapples = 0;
    this.redapples = 0;
    this.wallsavoided = 0;
    this.avoidWalls = 0;
    this.autoRespawn = 0;
    this.autoMove = false;
    this.hunger = 0;
    this._gameinterval = null;
    this.speedmax = 20;
    this.speedstart = 300
    this.speedscaling = 1.2;

    this.snake = [
        { x: 12, y: 12 }
    ];
    this.gameover = false;
    this.direction = { x: 0, y: 0 };
    this.size = 1;
    this.movessincelastfood = 0;
    this.food = { x: 10, y: 10, type: 'green' };

    this.generateFood = function() {
        let x = Math.floor(Math.random() * 21)+2;
        let y = Math.floor(Math.random() * 21)+2;
        let foodType = 'green';
        const totalApplesEaten = this.greenapples + this.redapples;
        if (totalApplesEaten % 10 === 0 && totalApplesEaten > 0) {
            foodType = 'red';
        }
        this.food = { x: x, y: y, type: foodType };
    };

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

            if (this.food.type === 'red') {
                this.redapples++;
                this._ui.addMessage('You ate a red apple!  Wow, the colours!');
                this._ui.updateStat('redapples', this.redapples);
            } else {
                this.greenapples++;
                if (this.greenapples == 1) {
                    this._ui.addMessage('You ate a green apple');
                }
                if (this.greenapples == 10) {
                    this._ui.addMessage('You\'ve eaten a few apples, congratulations.  You are a true master of the apple eating arts (no achievment)');
                }

                this._ui.updateStat('greenapples', this.greenapples);
            }

            this.generateFood();
            this.updateFPS();

            return true;
        } else {
            this.movessincelastfood++;
            if (this.movessincelastfood % 100 == 0) {
                this.hunger++;
                if (this.hunger == 1) {
                    this._ui.addMessage('You are hungry');
                }
                if (this.hunger == 5) {
                    this._ui.addMessage('You are very hungry');
                }

                this._ui.updateStat('hunger', this.hunger);
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

    this.addAchievment = function(message) {
        this.achievements++
        this._ui.addAchievment(message);
    };

    this.incrementDeaths = function() {
        this.deaths++;
        if (this.deaths == 1) {
            this._ui.addMessage('You died');
        }
        if (this.deaths == 5) {
            this._ui.addMessage('You died 5 times.  It would be an achievement if it wasn\'t so sad');
        }
        if (this.deaths == 20) {
            this.addAchievment('Respawn Wonder!  Death seems to be a common theme for you');
        }
        if (this.deaths == 100) {
            this.addAchievment('So Much Respawn!  You are a true master of the art of dying');
        }

        this._ui.updateStat('deathcount', this.deaths);
    };

    this.updateGameState = function() {
        let nextX = this.snake[0].x + this.direction.x;
        let nextY = this.snake[0].y + this.direction.y;

        if (this.avoidWalls > 0 && this.checkWallCollision(nextX, nextY)) {
            this.wallsavoided++;
            this._ui.updateStat('wallsavoided', this.wallsavoided);
            // Turn right logic
            const { x, y } = this.direction;
            if (x === 1) this.direction = { x: 0, y: 1 }; // Right -> Down
            else if (x === -1) this.direction = { x: 0, y: -1 }; // Left -> Up
            else if (y === 1) this.direction = { x: -1, y: 0 }; // Down -> Left
            else if (y === -1) this.direction = { x: 1, y: 0 }; // Up -> Right
        }

        const { newX, newY } = this.moveSnake();

        if (!this.checkFoodCollision(newX, newY)) {
            this.snake.pop();
        }

        let collision = this.checkSelfCollision(newX, newY) || this.checkWallCollision(newX, newY);

        if (collision) {
            this.incrementDeaths();
            this.gameover = true;
            if (this.autoRespawn > 0) {
                setTimeout(() => {
                    this.initializeGameState();
                }, 5000);
            }
            return;
        } else {
            this.updateStepsAndSize();
        }
    };

    this.updateStepsAndSize = function() {
        if (this.direction.x !== 0 || this.direction.y !== 0) {

            this.totalsteps++;
            this._ui.updateStat('totalsteps', this.totalsteps);
        }

        if (this.size > this.maxsize) {
            this.maxsize = this.size;
            this._ui.updateStat('maxsize', this.maxsize);

            // TODO move this to the UI
            if (this.maxsize % 5 === 0) {
                document.getElementById('maxsize').parentElement.classList.remove('hidden');
                this.addAchievment("You have reached a max size of " + this.maxsize + "!");
            }
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
        if (this.autoMove) {
            this.direction = { x: 0, y: -1 };
        }
        this.size = 3;
        this.movessincelastfood = 0;
        this.generateFood();
        this.updateFPS();
    };

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
        if (this._gameinterval != null) clearInterval(this._gameinterval);
    };

    this.updateFPS = function() {
        this.stopFPS();
        const that = this;
        const msPerFrame = Math.max(this.speedmax, this.speedstart/Math.pow(this.speedscaling,this.size-1));
        this._gameinterval = setInterval(function () {
            if (!that.gameover) {
                that.updateGameState();
            }
            that._ui.draw();
        }, msPerFrame);
    };

    this.initializeGameState();

}