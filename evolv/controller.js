function makeController(actionsParam) {

    let actions = actionsParam;

    let keyCodeDown = {};

    let listeners = { 
        keydown : function keyDown(event) { keyCodeDown[event.keyCode] = Date.now() + 60*1000; },
        keyup : function keyUp(event) { delete keyCodeDown[event.keyCode];}
    };

    this.addListeners = function() {
        for (listener in listeners) {
            window.addEventListener(listener, listeners[listener] , false )
        }
    };

    this.removeListeners = function() {
        for (listener in listeners) {
            window.removeEventListener(listener, listeners[listener] )
        }
    };

    let doAction = function(keyCode,deltaTime){
        let action = "" + keyCode;
        action = (action in actions) ? action : "default";
        actions[action].funct(keyCode,deltaTime);
    }

    this.update = function(deltaTime,now) {
        Object.keys(keyCodeDown)
            .filter(function(key){ return keyCodeDown[key] <= now })
            .forEach(function(key){ delete keyCodeDown[key] });

        Object.keys(keyCodeDown)
            .forEach(function(key){
                doAction(key,deltaTime)
            })
    }

    this.addListeners();

    return this;
};