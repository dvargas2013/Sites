function KeyboardInputManager() {
    this.events = {};

    this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
    if (!this.events[event]) {
        this.events[event] = [];
    }
    this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
    var callbacks = this.events[event];
    if (callbacks) {
        callbacks.forEach(function (callback) {
            callback(data);
        });
    }
};

KeyboardInputManager.prototype.listen = function () {
    var self = this,
        retry = document.getElementsByClassName("retry-button")[0],
        cells,
        n,
        f = function (n, v) {
            return function (e) {
                var x = n % 4,
                    y = Math.floor(n / 4);
                self.emit("move", {
                    x: x,
                    y: y,
                    value: v
                });
                e.preventDefault();
                return false;
            };
        };
    retry.addEventListener("click", this.restart.bind(this));

    /* prevent stray menus popping up */
    document.getElementsByClassName("game-container")[0]
        .addEventListener("contextmenu", function (e) {
            e.preventDefault();
            return false;
        }, true);

    cells = document.getElementsByClassName("grid-cell");
    for (n = 0; n < 16; n += 1) {
        cells[n].addEventListener("click", f(n, 2), true);
        cells[n].addEventListener("contextmenu", f(n, 4), true);
    }
};

KeyboardInputManager.prototype.restart = function (event) {
    event.preventDefault();
    this.emit("restart");
};