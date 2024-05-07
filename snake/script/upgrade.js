'use strict';

var fullUpgradeList = {
    'speed1' : {
        name: 'Speed 1',
        description: 'Increases the start speed of snake',
        cost: {
            maxsize: 20
        },
        applyEffect: (game) => {
            game.speedstart *= 0.75;
            game.updateFPS();
        }
    },
    'steady1' : {
        name: 'Steady 1',
        description: 'Reduce the speed scaling of snake',
        cost: {
            maxsize: 10,
        },
        applyEffect: (game) => {
            game.speedscaling = ( game.speedscaling - 1 ) * 0.5 + 1;
            game.updateFPS();
        }
    },
    'speed2' : {
        name: 'Speed 2',
        description: 'Increases the start speed of snake',
        cost: {
            greenapples: 10,
            deaths: 5,
        },
        applyEffect: (game) => {
            game.speedstart *= 0.75;
            game.updateFPS();
        }
    },
    'steady2' : {
        name: 'Steady 2',
        description: 'Reduce the speed scaling of snake',
        cost: {
            greenapples: 10,
            deaths: 5,
        },
        applyEffect: (game) => {
            game.speedscaling = ( game.speedscaling - 1 ) * 0.5 + 1;
            game.updateFPS();
        }
    }
}

let order = 0;
for (let upgrade in fullUpgradeList) {
    fullUpgradeList[upgrade].id = upgrade;
    fullUpgradeList[upgrade].order = order;
}


export function Upgrade(game, ui) {
    this._game = game;
    this._ui = ui;
    ui.setUpgrade(this);

    this.applied = {};
    this.shown = {};

    this.canApplyUpgrade = function(upgradeId) {
        let canUpgrade = 1.0;
        let upgrade = fullUpgradeList[upgradeId];
        for (let resource in upgrade.cost) {
            if (this._game[resource] < upgrade.cost[resource]) {
                if (canUpgrade == 1.0) {
                    canUpgrade = this._game[resource] / upgrade.cost[resource];
                } else {
                    canUpgrade = Math.max(canUpgrade, this._game[resource] / upgrade.cost[resource]);
                }
            }
        }
        upgrade.canUpgrade = canUpgrade;
        return canUpgrade;
    };

    this.applyUpgrade = function(upgradeId) {
        // first, make sure we can apply the upgrade
        let upgrade = fullUpgradeList[upgradeId];
        if (!this.applied[upgradeId] && this.canApplyUpgrade(upgradeId) != 1.0) {
            return false;
        } else {
            // apply the upgrade
            upgrade.applyEffect(this._game);
            // remove the resources
            for (let resource in upgrade.cost) {
                this._game[resource] -= upgrade.cost[resource];
            }
            this.applied[upgradeId] = true;
            return true;
        }
    };

    this.listAvailableUpgrades = function() {
        let available = [];
        for (let upgradeId in fullUpgradeList) {
            let upgrade = fullUpgradeList[upgradeId];
            if (!this.applied[upgradeId]) {
                let canUpgrade = this.canApplyUpgrade(upgradeId) >= 0.5;
                if (!!this.shown[upgradeId] || canUpgrade) {
                    available.push(upgrade);
                    this.shown[upgradeId] = true;
                }
            }
        }
        return available;
    };

}
