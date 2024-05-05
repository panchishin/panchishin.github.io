'use strict';

export function UI() {

    this._canvas = document.getElementById('canvas');
    this._ctx = canvas.getContext('2d');
    this._canvas.width = 500;
    this._canvas.height = 500;
    this._pixelSize = Math.min(this._canvas.width, this._canvas.height) / 25;
    this._game = null;
    this.messages = [];
    this.visibleFields = {};
    this.maxMessages = 20;

    this.setGame = function(game) {
        this._game = game;
    }

    this.showSavedValues = function() {
        for (let key in this.visibleFields) {
            const element = document.getElementById(key);
            element.innerText = this.visibleFields[key];
            element.parentElement.classList.remove('hidden');
        }
        // clear the messages
        document.getElementById('messagelog').innerHTML = '';
        for (let item of this.messages) {
            this.addMessage(item.message, item.cssclass, false);
        }
    }

    this.updateStat = function(statId, value) {
        this.visibleFields[statId] = value;
        const element = document.getElementById(statId);
        element.innerText = value;

        const powerOfTwo = value && (value & (value - 1)) === 0;
        if ((value < 32) || powerOfTwo) {
            this.shakeElement(element.parentElement);
        }
        return this;
    };

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
        this._ctx.fillStyle = 'black';
        this._ctx.fillText(text, x-2, y-2);
        this._ctx.fillStyle = 'black';
        this._ctx.fillText(text, x+2, y+2);
        this._ctx.fillStyle = 'black';
        this._ctx.fillText(text, x+2, y-2);
        this._ctx.fillStyle = 'black';
        this._ctx.fillText(text, x-2, y+2);
        this._ctx.fillStyle = 'gray';
        this._ctx.fillText(text, x, y);
    };

    this.draw = function() {
        // clear the canvas
        this._ctx.fillStyle = 'black';
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        // Render snake
        this._ctx.fillStyle = 'white';
        for (let i = 0; i < this._game.snake.length; i++) {
            this._ctx.fillRect(this._game.snake[i].x * this._pixelSize, this._game.snake[i].y * this._pixelSize, this._pixelSize, this._pixelSize);
        }

        // Render food
        if (this._game.food) {
            this._ctx.fillStyle = 'green';
            this._ctx.fillRect(this._game.food.x * this._pixelSize, this._game.food.y * this._pixelSize, this._pixelSize, this._pixelSize);
        }

        // Render size
        this._ctx.textAlign = 'left';
        this._ctx.textBaseline = 'top';
        this._ctx.fillStyle = 'lightgray';

        // Render game over
        if (this._game.gameover) {
            this._ctx.font = '48px Arial';
            this.fillText('Dead Snake', 100, 100);
            this._ctx.font = '24px Arial';
            this.fillText("press 'r' to respawn", 130, 150);
        }
    };

    this.addMessage = function(message, cssclass=null, record=true) {
        if (record) {
            this.messages.push( {message:message, cssclass:cssclass} );
            while (this.messages.length > 10) {
                this.messages.shift();
            }
        }
        let span = document.createElement("span");
        span.innerHTML = message;
        if (cssclass != null) span.classList.add(cssclass)
        let div = document.createElement("div")
        div.appendChild(span)
        let log = document.getElementById("messagelog");
        log.insertBefore(div, log.firstChild);
        if (document.getElementById("messagelog").children.length > this.maxMessages) {
            document.getElementById("messagelog").lastChild.remove();
        }
    };

    this.addAchievment = function(message) {
        this.addMessage("Achievement :&nbsp;" + message, "achievements");

        // update the count
        document.getElementById('achievements').parentElement.classList.remove('hidden');
        document.getElementById('achievements').innerText = this._game.achievements;
        this.shakeId('achievements');
    };

}