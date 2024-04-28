'use strict';

import { SnakeGame } from './game.js';
import { UI } from './ui.js';


function loadFromLocalStorage(saveLocation, obj) {
    if (localStorage.getItem(saveLocation)) {
        let data = JSON.parse(localStorage.getItem(saveLocation));
        for (let key in data) {
            if (!key.startsWith('_')) {
                obj[key] = data[key];
            }
        }
    }
}

function saveToLocalStorage(saveLocation, obj) {
    let publicObj = {};
    for (let key in obj) {
        if (!key.startsWith('_')) {
            publicObj[key] = obj[key];
        }
    }
    localStorage.setItem(saveLocation, JSON.stringify(publicObj));
}

// on document ready
document.addEventListener('DOMContentLoaded', function () {

    let ui = new UI();
    let game = new SnakeGame(ui);

    // Initialize the game
    game.initializeGameState();

    loadFromLocalStorage('snakegame', game);
    loadFromLocalStorage('snakeui', ui);

    function saveGame() {
        saveToLocalStorage('snakegame', game);
        saveToLocalStorage('snakeui', ui);
    }

    let saveInterval = setInterval(() => saveGame, 5000);

    function introComplete() {
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

        ui.showSavedValues();
        game.updateFPS();

    }

    // Add event listener for key presses
    document.addEventListener('keydown', (event)=>{game.handleKeyPress(event)});

    document.getElementById('hardreset').addEventListener('click', () => {
        clearInterval(saveInterval);
        localStorage.clear();
        window.location.reload();
    });        


    if (game['introComplete']) {
        introComplete();
    } else {
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
        }, 10000);
        
        document.getElementById('start').addEventListener('click', () => {
            ui = new UI();
            ui.showSavedValues();
            game.stopFPS();
            game = new SnakeGame(ui);
            game['introComplete'] = true;            
            game.initializeGameState();
            saveGame();
            introComplete();
        });
    }
});