function HTMLActuator() {
    this.tileContainer = document.getElementsByClassName("tile-container")[0];
    this.scoreContainer = document.getElementsByClassName("score-container")[0];
    this.messageContainer = document.getElementsByClassName("game-message")[0];
    this.sharingContainer = document.getElementsByClassName("score-sharing")[0];

    this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
    var self = this;

    window.requestAnimationFrame(function () {
        self.clearContainer(self.tileContainer);

        grid.cells.forEach(function (column) {
            column.forEach(function (cell) {
                if (cell) {
                    self.addTile(cell);
                }
            });
        });

        self.updateScore(metadata.score);

        if (metadata.over) {
            self.message(true);
        } // You win!
        if (metadata.won) {
            self.message(false);
        } // You lose
    });
};

HTMLActuator.prototype.restart = function () {
    this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

HTMLActuator.prototype.addTile = function (tile) {
    var self = this,
        element = document.createElement("div"),
        position = tile.previousPosition || {
            x: tile.x,
            y: tile.y
        },
        positionClass = this.positionClass(position),
        classes = ["tile", "tile-" + tile.value, positionClass];
    this.applyClasses(element, classes);

    element.textContent = tile.value;

    if (tile.previousPosition) {
        // Make sure that the tile gets rendered in the previous position first
        window.requestAnimationFrame(function () {
            classes[2] = self.positionClass({
                x: tile.x,
                y: tile.y
            });
            self.applyClasses(element, classes); // Update the position
        });
    } else if (tile.mergedFrom) {
        classes.push("tile-merged");
        this.applyClasses(element, classes);

        // Render the tiles that merged
        tile.mergedFrom.forEach(function (merged) {
            self.addTile(merged);
        });
    } else {
        classes.push("tile-new");
        this.applyClasses(element, classes);
    }

    // Put the tile on the board
    this.tileContainer.appendChild(element);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
    element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
    return {
        x: position.x + 1,
        y: position.y + 1
    };
};

HTMLActuator.prototype.positionClass = function (position) {
    position = this.normalizePosition(position);
    return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
    this.clearContainer(this.scoreContainer);

    var diff = score - this.score,
        add;
    this.score = score;

    this.scoreContainer.textContent = this.score;

    if (diff > 0) {
        add = document.createElement("div");
        add.classList.add("score-addition");
        add.textContent = "+" + diff;

        this.scoreContainer.appendChild(add);
    }
};

HTMLActuator.prototype.message = function (won) {
    var type = won ? "game-won" : "game-over";

    this.messageContainer.classList.add(type);
};

HTMLActuator.prototype.clearMessage = function () {
    this.messageContainer.classList.remove("game-won", "game-over");
};