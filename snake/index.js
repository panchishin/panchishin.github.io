'use strict';

import { SnakeGame } from './game.js';
import { UI } from './ui.js';


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