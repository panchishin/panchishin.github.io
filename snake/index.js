'use strict';

import { SnakeGame } from './game.js';


export function UI() {

    this.canvas = document.getElementById('canvas');
    this.ctx = canvas.getContext('2d');
    this.canvas.width = 500;
    this.canvas.height = 500;
    this.pixelSize = Math.min(this.canvas.width, this.canvas.height) / 25;

    this.shakeId = function(elementid) {
        let element = document.getElementById(elementid).parentElement;
        shakeElement(element);
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

    this.draw = function(game) {
        // clear the canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render snake
        this.ctx.fillStyle = 'white';
        for (let i = 0; i < game.snake.length; i++) {
            this.ctx.fillRect(game.snake[i].x * this.pixelSize, game.snake[i].y * this.pixelSize, this.pixelSize, this.pixelSize);
        }

        // Render food
        if (game.food) {
            this.ctx.fillStyle = 'green';
            this.ctx.fillRect(game.food.x * this.pixelSize, game.food.y * this.pixelSize, this.pixelSize, this.pixelSize);
        }

        // Render size
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillStyle = 'lightgray';

        // Render game over
        if (game.gameover) {
            this.ctx.font = '48px Arial';
            this.fillText('Dead Snake', 100, 100);
            this.ctx.font = '24px Arial';
            this.fillText("press 'r' to respawn", 130, 150);
        }
    };

}



// on document ready
document.addEventListener('DOMContentLoaded', function () {

    const ui = new UI();
    const game = new SnakeGame(ui);
    
    // Initialize the game
    game.initializeGameState();
    
    // Add event listener for key presses
    document.addEventListener('keydown', (event)=>{game.handleKeyPress(event)});
    
    // make a list of all the hidden elements under the element with id 'uselessTextBox'
    const hiddenElements = Array.from(document.getElementById('welcome').querySelectorAll('.hidden'));
    // every 5 seconds remove the hidden class from the next element in the list
    ui.shakeElement(hiddenElements[0]);
    hiddenElements.shift();
    let uselessTextBoxInterval = setInterval(() => {
        if (hiddenElements.length > 0) {
            ui.shakeElement(hiddenElements[0]);
            hiddenElements.shift();
        } else {
            clearInterval(uselessTextBoxInterval);
        }
    }, 5000);
    
    document.getElementById('start').addEventListener('click', () => {
        game.stopFPS();
        game.reset();
        game.initializeGameState();
        
        // find element named 'welcome' and delete it
        document.getElementById('welcome').remove();

        // hide all the stats
        document.getElementById('stats').querySelectorAll('div').forEach((element) => {
            element.classList.add('hidden');
        });

        // remove all elements in the element with id 'messagelog'
        document.getElementById('messagelog').innerHTML = '';

        document.querySelectorAll('fieldset').forEach((element) => {
            element.classList.remove('hidden');
        });
    });

});