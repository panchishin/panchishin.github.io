'use strict';

export function UI() {

    this.canvas = document.getElementById('canvas');
    this.ctx = canvas.getContext('2d');
    this.canvas.width = 500;
    this.canvas.height = 500;
    this.pixelSize = Math.min(this.canvas.width, this.canvas.height) / 25;
    this.game = null;

    this.setGame = function(game) {
        this.game = game;
    }

    this.shakeId = function(elementid) {
        let element = document.getElementById(elementid).parentElement;
        this.shakeElement(element);
    };
    
    this.shakeElement = function(element) {
        element.classList.remove('hidden');
        element.classList.remove('shake');
        element.offsetWidth;
        element.classList.add('shake');
    };


    this.fillText = function(text, x, y) {
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(text, x-2, y-2);
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(text, x+2, y+2);
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(text, x+2, y-2);
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(text, x-2, y+2);
        this.ctx.fillStyle = 'gray';
        this.ctx.fillText(text, x, y);
    };

    this.draw = function() {
        // clear the canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render snake
        this.ctx.fillStyle = 'white';
        for (let i = 0; i < this.game.snake.length; i++) {
            this.ctx.fillRect(this.game.snake[i].x * this.pixelSize, this.game.snake[i].y * this.pixelSize, this.pixelSize, this.pixelSize);
        }

        // Render food
        if (this.game.food) {
            this.ctx.fillStyle = 'green';
            this.ctx.fillRect(this.game.food.x * this.pixelSize, this.game.food.y * this.pixelSize, this.pixelSize, this.pixelSize);
        }

        // Render size
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillStyle = 'lightgray';

        // Render game over
        if (this.game.gameover) {
            this.ctx.font = '48px Arial';
            this.fillText('Dead Snake', 100, 100);
            this.ctx.font = '24px Arial';
            this.fillText("press 'r' to respawn", 130, 150);
        }
    };

    this.addMessage = function(message, cssclass=null) {
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
    };

    this.addAchievment = function(message) {
        this.addMessage("Achievement : " + message, "achievements");

        // update the count
        document.getElementById('achievements').parentElement.classList.remove('hidden');
        document.getElementById('achievements').innerText = this.game.achievements;
        this.shakeId('achievements');
    };

}