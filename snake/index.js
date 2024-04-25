'use strict';

import { SnakeGame } from './game.js';

// on document ready
document.addEventListener('DOMContentLoaded', function () {

    const game = new SnakeGame();
    
    // Initialize the game
    game.initializeGameState();
    
    // Add event listener for key presses
    document.addEventListener('keydown', (event)=>{game.handleKeyPress(event)});
    
    // make a list of all the hidden elements under the element with id 'uselessTextBox'
    const hiddenElements = Array.from(document.getElementById('uselessTextBox').querySelectorAll('.hidden'));
    // every 5 seconds remove the hidden class from the next element in the list
    let uselessTextBoxInterval = setInterval(() => {
        if (hiddenElements.length > 0) {
            hiddenElements[0].classList.remove('hidden');
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

        // add the class 'hidden' to all 'div' elements under the element with id 'stats'
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