'use strict';

import { SnakeGame } from './game.js';
import { UI } from './ui.js';
import { Upgrade } from './upgrade.js';

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

    let ui;
    let game;
    let upgrade;

    function resetGame(){
        ui = new UI();
        game = new SnakeGame(ui);
        upgrade = new Upgrade(game, ui);
    };
    resetGame();

    // Initialize the game
    game.initializeGameState();

    loadFromLocalStorage('snakegame', game);
    loadFromLocalStorage('snakeui', ui);
    loadFromLocalStorage('snakeupgrade', upgrade);

    function saveGame() {
        saveToLocalStorage('snakegame', game);
        saveToLocalStorage('snakeui', ui);
        saveToLocalStorage('snakeupgrade', upgrade);

        const element = document.getElementById('autosaved');
        element.classList.remove('slidein');
        element.offsetWidth;
        element.classList.add('slidein');
    }

    let saveInterval = setInterval(saveGame, 30000);

    function intro() {
        const hiddenElements = Array.from(document.getElementById('welcome').querySelectorAll('.hidden'));
        // every 5 seconds remove the hidden class from the next element in the list
        ui.shakeElement(hiddenElements[0]);
        hiddenElements.shift();
        const uselessDelay = document.location.href === 'http://localhost:8002/'
        ? 100 : 10000;
        let uselessTextBoxInterval = setInterval(() => {
            if (hiddenElements.length > 0) {
                ui.shakeElement(hiddenElements[0]);
                hiddenElements.shift();
            } else {
                clearInterval(uselessTextBoxInterval);
            }
        }, uselessDelay);
        
        document.getElementById('start').addEventListener('click', () => {
            game.stopFPS();
            resetGame();
            ui.showSavedValues();
            game['introComplete'] = true;            
            game.initializeGameState();
            saveGame();
            introComplete();
        });
    };

    function introComplete() {
        // find element named 'welcome' and delete it
        document.getElementById('welcome').remove();

        // hide all the stats
        document.getElementById('stats').querySelectorAll('div').forEach((element) => {
            element.classList.add('hidden');
        });

        game.updateFPS();
        ui.showSavedValues();

        document.querySelectorAll('fieldset').forEach((element) => {
            element.classList.remove('hidden');
        });

        setInterval(() => { ui.updateUpgrades() }, 250);
        ui.updateUpgrades();

    }

    // Add event listener for key presses
    document.addEventListener('keydown', (event)=>{game.handleKeyPress(event)});

    document.getElementById('hardreset').addEventListener('click', () => {
        clearInterval(saveInterval);
        localStorage.clear();
        window.location.reload();
    });

    document.getElementById('manualsave').addEventListener('click', () => {
        saveGame();
    });

    if (game['introComplete']) {
        introComplete();
    } else {
        intro();
    }
});