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

    this.setUpgrade = function(upgrade) {
        this._upgrade = upgrade;
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

    this.updateUpgrades = function() {
        let availableUpgradeList = this._upgrade.listAvailableUpgrades();

        // get the upgrade list
        let displayedUpgradeList = document.getElementById('upgrades');
        // go throug hte displayedUpgradeList and remove the children that are not in the availableUpgradeList
        for (let i = 0; i < displayedUpgradeList.children.length; i++) {
            let upgrade = displayedUpgradeList.children[i];
            let upgradeId = upgrade.getAttribute('upgradeId');
            if (!availableUpgradeList.find((upgrade) => upgrade.id === upgradeId)) {
                upgrade.remove();
            }
        }
        // create a list of all the ids in the displayedUpgradeList
        let displayedUpgradeListIds = Array.from(displayedUpgradeList.children).map((element) => element.getAttribute('upgradeId'));
        // create a list of availableUpgradeList where the id is not in displayedUpgradeListIds
        let missingUpgradeList = availableUpgradeList.filter((upgrade) => !displayedUpgradeListIds.includes(upgrade.id));

        const infoBox = document.getElementById("info-box");

        // add the new upgrades to the list
        for (let upgrade of missingUpgradeList) {
            let upgradeElement = document.createElement('button');
            upgradeElement.setAttribute('upgradeId', upgrade.id);
            upgradeElement.innerText = upgrade.name;

            upgradeElement.disabled = (1.0 != this._upgrade.canApplyUpgrade(upgrade.id))

            upgradeElement.addEventListener('click', () => {
                if (this._upgrade.applyUpgrade(upgrade.id)) {
                    upgradeElement.remove();
                    infoBox.classList.remove("show");
                }
            });
            displayedUpgradeList.appendChild(upgradeElement);


            let element = document.querySelector("#upgrades button[upgradeId=" + upgrade.id + "]");
            let that = this;
            element.addEventListener("mouseover", () => {
                infoBox.innerHTML = `<p>${upgrade.description}</p>`;
                for (let resource in upgrade.cost) {
                    if (that._game[resource] < upgrade.cost[resource]) {
                        infoBox.innerHTML += `\n<p class="insufficient">${resource}: ${upgrade.cost[resource]}</p>`;
                    } else {
                        infoBox.innerHTML += `\n<p>${resource}: ${upgrade.cost[resource]}</p>`;
                    }
                }
                infoBox.classList.add("show");
                infoBox.style.top = `${element.offsetTop + element.offsetHeight}px`;
                infoBox.style.left = `${element.offsetLeft}px`;
            });

            element.addEventListener("mouseout", () => {
                infoBox.classList.remove("show");

            });
        }

        for (let upgrade of availableUpgradeList) {
            try {
                let element = document.querySelector("#upgrades button[upgradeId=" + upgrade.id + "]");
                element.disabled = (1.0 != upgrade.canUpgrade);
            } catch (e) {
                console.log("Could not find " + upgrade.id);
            }
        }
    }
}