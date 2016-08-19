function Tile(position, value) {

    this.x = position.x;
    this.y = position.y;
    this.value = value || 2;

    this.previousPosition = null;
    this.mergedFrom = null; // Tracks tiles that merged together
}

Tile.prototype.savePosition = function () {

    this.previousPosition = {
        x: this.x,
        y: this.y
    };
};

Tile.prototype.updatePosition = function (position) {

    this.x = position.x;
    this.y = position.y;
};

Tile.prototype.serialize = function () {

    return {
        position: {
            x: this.x,
            y: this.y
        },
        value: this.value
    };
};

function Grid(size, previousState) {

    this.size = size;
    this.cells = previousState ? this.fromState(previousState) : this.empty();
}

Grid.prototype.fromState = function (state) {

    var cells = [], x, y, row, tile;

    for (x = 0; x < this.size; x += 1) {
        row = cells[x] = [];

        for (y = 0; y < this.size; y += 1) {
            tile = state[x][y];
            row.push(tile ? new Tile(tile.position, tile.value) : null);
        }
    }

    return cells;
};

// Build a grid of the specified size
Grid.prototype.empty = function () {

    var cells = [], x, y, row;

    for (x = 0; x < this.size; x += 1) {
        row = cells[x] = [];

        for (y = 0; y < this.size; y += 1) {
            row.push(null);
        }
    }

    return cells;
};

// Find the first available random position
Grid.prototype.randomAvailableCell = function () {

    var cells = this.availableCells();

    if (cells.length) {
        return cells[Math.floor(Math.random() * cells.length)];
    }
};

Grid.prototype.availableCells = function () {

    var cells = [];

    this.eachCell(function (x, y, tile) {
        if (!tile) {
            cells.push({
                x: x,
                y: y
            });
        }
    });

    return cells;
};

// Call callback for every cell
Grid.prototype.eachCell = function (callback) {

    var x, y;
    for (x = 0; x < this.size; x += 1) {
        for (y = 0; y < this.size; y += 1) {
            callback(x, y, this.cells[x][y]);
        }
    }
};

// Check if there are any cells available
Grid.prototype.cellsAvailable = function () {

    return !!this.availableCells().length;
};

// Check if the specified cell is taken
Grid.prototype.cellAvailable = function (cell) {

    return !this.cellOccupied(cell);
};

Grid.prototype.cellOccupied = function (cell) {

    return !!this.cellContent(cell);
};

Grid.prototype.cellContent = function (cell) {

    if (this.withinBounds(cell)) {
        return this.cells[cell.x][cell.y];
    } else {
        return null;
    }
};

// Inserts a tile at its position
Grid.prototype.insertTile = function (tile) {

    this.cells[tile.x][tile.y] = tile;
};

Grid.prototype.removeTile = function (tile) {

    this.cells[tile.x][tile.y] = null;
};

Grid.prototype.withinBounds = function (position) {

    return position.x >= 0 && position.x < this.size && position.y >= 0 && position.y < this.size;
};

Grid.prototype.serialize = function () {

    var cellState = [], x, y, row;

    for (x = 0; x < this.size; x += 1) {
        row = cellState[x] = [];

        for (y = 0; y < this.size; y += 1) {
            row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
        }
    }

    return {
        size: this.size,
        cells: cellState
    };
};

function GameManager(size, InputManager, Actuator, StorageManager) {

    this.size = size; // Size of the grid
    this.inputManager = new InputManager();
    this.storageManager = new StorageManager();
    this.actuator = new Actuator();

    this.startTiles = this.size/2;

    this.inputManager.on("move", this.move.bind(this));
    this.inputManager.on("restart", this.restart.bind(this));
    this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

    this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {

    this.storageManager.clearGameState();
    this.actuator.continueGame(); // Clear the game won/lost message
    this.setup();
};

// Keep playing after winning (allows going over 2048)
GameManager.prototype.keepPlaying = function () {

    this.keepPlaying = true;
    this.actuator.continueGame(); // Clear the game won/lost message
};

// Return true if the game is lost, or has won and the user hasn't kept playing
GameManager.prototype.isGameTerminated = function () {

    return this.over || (this.won && !this.keepPlaying);
};

// Set up the game
GameManager.prototype.setup = function () {

    var previousState = this.storageManager.getGameState();

    // Reload the game from a previous game if present
    if (previousState) {
        this.grid = new Grid(previousState.grid.size, previousState.grid.cells); // Reload grid
        this.score = previousState.score;
        this.over = previousState.over;
        this.won = previousState.won;
        this.keepPlaying = previousState.keepPlaying;
    } else {
        this.grid = new Grid(this.size);
        this.score = 0;
        this.over = false;
        this.won = false;
        this.keepPlaying = false;

        // Add the initial tiles
        this.addStartTiles();
    }

    // Update the actuator
    this.actuate();
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {

    var i;
    for (i = 0; i < this.startTiles; i += 1) {
        this.addRandomTile();
    }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {

    if (this.grid.cellsAvailable()) {
        this.grid.insertTile(new Tile(this.grid.randomAvailableCell(), 2));
    }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {

    if (this.storageManager.getBestScore() < this.score) {
        this.storageManager.setBestScore(this.score);
    }

    // Clear the state when the game is over (game over only, not win)
    if (this.over) {
        this.storageManager.clearGameState();
    } else {
        this.storageManager.setGameState(this.serialize());
    }

    this.actuator.actuate(this.grid, {
        score: this.score,
        over: this.over,
        won: this.won,
        bestScore: this.storageManager.getBestScore(),
        terminated: this.isGameTerminated()
    });
};

// Represent the current game as an object
GameManager.prototype.serialize = function () {

    return {
        grid: this.grid.serialize(),
        score: this.score,
        over: this.over,
        won: this.won,
        keepPlaying: this.keepPlaying
    };
};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {

    this.grid.eachCell(function (x, y, tile) {
        if (tile) {
            tile.mergedFrom = null;
            tile.savePosition();
        }
    });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {

    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {


    if (this.isGameTerminated()) {
        return;
    }

    // 0: up, 1: right, 2: down, 3: left
    var self = this, cell, tile,
        vector = this.getVector(direction),
        traversals = this.buildTraversals(vector),
        moved = false;

    // Save the current tile positions and remove merger information
    this.prepareTiles();

    // Traverse the grid in the right direction and move tiles
    traversals.x.forEach(function (x) {
        traversals.y.forEach(function (y) {
            cell = {
                x: x,
                y: y
            };
            tile = self.grid.cellContent(cell);

            if (tile) {
                var positions = self.findFarthestPosition(cell, vector),
                    next = self.grid.cellContent(positions.next),
                    merged;

                // Only one merger per row traversal?
                if (next && next.value === tile.value && !next.mergedFrom) {
                    merged = new Tile(positions.next, tile.value * 2);
                    merged.mergedFrom = [tile, next];

                    self.grid.insertTile(merged);
                    self.grid.removeTile(tile);

                    // Converge the two tiles' positions
                    tile.updatePosition(positions.next);

                    // Update the score
                    self.score += merged.value;

                    // The mighty 2048 tile
                    //if (merged.value === 2048) { self.won = true; }
                } else {
                    self.moveTile(tile, positions.farthest);
                }

                if (!self.positionsEqual(cell, tile)) {
                    moved = true;
                }
            }
        });
    });

    if (moved) {
        this.addRandomTile();
        if (!this.movesAvailable()) {
            this.over = true;
        }
        this.actuate();
    }

    return moved;
};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
    // Vectors representing tile movement

    var map = {
        0: {
            x: 0,
            y: -1
        }, // Up
        1: {
            x: 1,
            y: 0
        }, // Right
        2: {
            x: 0,
            y: 1
        }, // Down
        3: {
            x: -1,
            y: 0
        } // Left
    };

    return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {

    var traversals = {
            x: [],
            y: []
        },
        pos;

    for (pos = 0; pos < this.size; pos += 1) {
        traversals.x.push(pos);
        traversals.y.push(pos);
    }

    // Always traverse from the farthest cell in the chosen direction
    if (vector.x === 1) {
        traversals.x = traversals.x.reverse();
    }
    if (vector.y === 1) {
        traversals.y = traversals.y.reverse();
    }
    return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {

    var previous;

    // Progress towards the vector direction until an obstacle is found
    do {
        previous = cell;
        cell = {
            x: previous.x + vector.x,
            y: previous.y + vector.y
        };
    } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

    return {
        farthest: previous,
        next: cell
    };
};

GameManager.prototype.movesAvailable = function () {

    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {

    var tile, x, y, direction, vector, cell, other;

    for (x = 0; x < this.size; x += 1) {
        for (y = 0; y < this.size; y += 1) {
            tile = this.grid.cellContent({
                x: x,
                y: y
            });

            if (tile) {
                for (direction = 0; direction < 4; direction += 1) {
                    vector = this.getVector(direction);
                    cell = {
                        x: x + vector.x,
                        y: y + vector.y
                    };
                    other = this.grid.cellContent(cell);

                    if (other && other.value === tile.value) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
};

GameManager.prototype.positionsEqual = function (first, second) {

    return first.x === second.x && first.y === second.y;
};