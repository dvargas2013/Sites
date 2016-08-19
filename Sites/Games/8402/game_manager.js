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

Tile.prototype.clone = function () {
    
    var newTile = new Tile({
        x: this.x,
        y: this.y
    }, this.value);
    //newTile.previousPosition = { x: this.previousPosition.x, y: this.previousPosition.y };
    //newTile.mergedFrom = { x: this.previousPosition.x, y: this.previousPosition.y };
    return newTile;
};

function AI(grid, depth) {
    
    this.grid = grid;
    this.depth = depth;
}

// static evaluation function
AI.prototype.evalM = function () {
    
    var emptyCells = this.grid.availableCells().length,
        smoothWeight = 0.1,
        //monoWeight   = 0.0,
        //islandWeight = 0.0,
        mono2Weight = 1.0,
        emptyWeight = 2.7,
        maxWeight = 1.0;

    return this.grid.smoothness() * smoothWeight
        //+ this.grid.monotonicity() * monoWeight
        //- this.grid.islands() * islandWeight
        + this.grid.monotonicity2() * mono2Weight + Math.log(emptyCells) * emptyWeight + this.grid.maxValue() * maxWeight;
};

//AI.prototype.cache = {}

// alpha-beta depth first search
AI.prototype.search = function (depth, alpha, beta, positions, cutoffs) {
    
    var bestScore,
        bestMove = -1,
        result,
        scores = {
            2: [],
            4: []
        },
        value,
        i,
        cell,
        tile,
        candidates = [],
        direction,
        newGrid,
        newAI,
        cells,
        maxScore,
        position;

    // the maxing player
    if (this.grid.playerTurn) {
        bestScore = alpha;
        for (direction = 0; direction < 4; direction += 1) {
            newGrid = this.grid.clone();
            if (newGrid.move(direction).moved) {
                positions += 1;
                if (newGrid.isWin()) {
                    return {
                        move: direction,
                        score: 10000,
                        positions: positions,
                        cutoffs: cutoffs
                    };
                }
                newAI = new AI(newGrid);
                if (depth === 0) {
                    result = {
                        move: direction,
                        score: newAI.evalM()
                    };
                } else {
                    result = newAI.search(depth - 1, bestScore, beta, positions, cutoffs);
                    if (result.score > 9900) { // win
                        result.score -= 1; // to slightly penalize higher depth from win
                    }
                    positions = result.positions;
                    cutoffs = result.cutoffs;
                }

                if (result.score > bestScore) {
                    bestScore = result.score;
                    bestMove = direction;
                }
                if (bestScore > beta) {
                    cutoffs += 1;
                    return {
                        move: bestMove,
                        score: beta,
                        positions: positions,
                        cutoffs: cutoffs
                    };
                }
            }
        }
    } else { // computer's turn, we'll do heavy pruning to keep the branching factor low
        bestScore = beta;

        // try a 2 and 4 in each cell and measure how annoying it is
        // with metrics from eval
        cells = this.grid.availableCells();

        for (value in scores) {
            for (i in cells) {
                scores[value].push(null);
                cell = cells[i];
                tile = new Tile(cell, parseInt(value, 10));
                this.grid.insertTile(tile);
                scores[value][i] = this.grid.islands() - this.grid.smoothness();
                this.grid.removeTile(cell);
            }
        }

        // now just pick out the most annoying moves
        maxScore = Math.max(Math.max.apply(null, scores[2]), Math.max.apply(null, scores[4]));
        for (value in scores) { // 2 and 4
            for (i = 0; i < scores[value].length; i += 1) {
                if (scores[value][i] === maxScore) {
                    candidates.push({
                        position: cells[i],
                        value: parseInt(value, 10)
                    });
                }
            }
        }

        // search on each candidate
        for (i = 0; i < candidates.length; i += 1) {
            position = candidates[i].position;
            value = candidates[i].value;
            newGrid = this.grid.clone();
            tile = new Tile(position, value);
            newGrid.insertTile(tile);
            newGrid.playerTurn = true;
            positions += 1;
            newAI = new AI(newGrid);
            result = newAI.search(depth, alpha, bestScore, positions, cutoffs);
            positions = result.positions;
            cutoffs = result.cutoffs;

            if (result.score < bestScore) {
                bestScore = result.score;
            }
            if (bestScore < alpha) {
                cutoffs += 1;
                return {
                    move: null,
                    score: alpha,
                    positions: positions,
                    cutoffs: cutoffs
                };
            }
        }
    }

    return {
        move: bestMove,
        score: bestScore,
        positions: positions,
        cutoffs: cutoffs
    };
};

// performs a search and returns the best move
AI.prototype.getBest = function () {
    
    return this.iterativeDeep();
};

// performs iterative deepening over the alpha-beta search
AI.prototype.iterativeDeep = function () {
    
    var depth = 0,
        best,
        newBest;
    do {
        newBest = this.search(depth, -10000, 10000, 0, 0);
        if (newBest.move === -1) {
            break;
        } else {
            best = newBest;
        }
        depth += 1;
    } while (depth < this.depth);
    return best;
};

AI.prototype.translate = function (move) {
    
    return {
        0: 'up',
        1: 'right',
        2: 'down',
        3: 'left'
    }[move];
};

function Grid(size) {
    
    this.size = size;
    this.startTiles = 2;

    this.cells = [];

    this.build();
    this.playerTurn = true;
}

// pre-allocate these objects (for speed)
Grid.prototype.indexes = [];
var x, y;
for (x = 0; x < 4; x += 1) {
    Grid.prototype.indexes.push([]);
    for (y = 0; y < 4; y += 1) {
        Grid.prototype.indexes[x].push({
            x: x,
            y: y
        });
    }
}

// Build a grid of the specified size
Grid.prototype.build = function () {
    
    var x, y, row;
    for (x = 0; x < this.size; x += 1) {
        row = this.cells[x] = [];

        for (y = 0; y < this.size; y += 1) {
            row.push(null);
        }
    }
};


// Find the first available random position
Grid.prototype.randomAvailableCell = function () {
    
    var cells = this.availableCells();

    if (cells.length) {
        return cells[Math.floor(Math.random() * cells.length)];
    }
};

Grid.prototype.availableCells = function () {
    
    var cells = [],
        self = this;

    this.eachCell(function (x, y, tile) {
        if (!tile) {
            //cells.push(self.indexes[x][y]);
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
    
    return position.x >= 0 && position.x < this.size &&
        position.y >= 0 && position.y < this.size;
};

Grid.prototype.clone = function () {
    
    var newGrid = new Grid(this.size),
        x,
        y;
    newGrid.playerTurn = this.playerTurn;
    for (x = 0; x < this.size; x += 1) {
        for (y = 0; y < this.size; y += 1) {
            if (this.cells[x][y]) {
                newGrid.insertTile(this.cells[x][y].clone());
            }
        }
    }
    return newGrid;
};

// Set up the initial tiles to start the game with
Grid.prototype.addStartTiles = function () {
    
    var i;
    for (i = 0; i < this.startTiles; i += 1) {
        this.addRandomTile();
    }
};

// Adds a tile in a random position
Grid.prototype.addRandomTile = function () {
    
    var value, tile;
    if (this.cellsAvailable()) {
        value = Math.random() < 0.9 ? 2 : 4;
        tile = new Tile(this.randomAvailableCell(), value);
        this.insertTile(tile);
    }
};

// Save all tile positions and remove merger info
Grid.prototype.prepareTiles = function () {
    
    this.eachCell(function (x, y, tile) {
        if (tile) {
            tile.mergedFrom = null;
            tile.savePosition();
        }
    });
};

// Move a tile and its representation
Grid.prototype.moveTile = function (tile, cell) {
    
    this.cells[tile.x][tile.y] = null;
    this.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
};


Grid.prototype.vectors = {
    0: {
        x: 0,
        y: -1
    }, // up
    1: {
        x: 1,
        y: 0
    }, // right
    2: {
        x: 0,
        y: 1
    }, // down
    3: {
        x: -1,
        y: 0
    } // left
};

// Get the vector representing the chosen direction
Grid.prototype.getVector = function (direction) {
     // Vectors representing tile movement
    return this.vectors[direction];
};

// Move tiles on the grid in the specified direction
// returns true if move was successful
Grid.prototype.move = function (direction) {
     // 0: up, 1: right, 2:down, 3: left
    var self = this,
        cell,
        tile,
        vector = this.getVector(direction),
        traversals = this.buildTraversals(vector),
        moved = false,
        score = 0,
        won = false;

    // Save the current tile positions and remove merger information
    this.prepareTiles();

    // Traverse the grid in the right direction and move tiles
    traversals.x.forEach(function (x) {
        traversals.y.forEach(function (y) {
            var positions, next, merged;
            cell = self.indexes[x][y];
            tile = self.cellContent(cell);

            if (tile) {
                //if (debug) {
                //console.log('tile @', x, y);
                //}
                positions = self.findFarthestPosition(cell, vector);
                next = self.cellContent(positions.next);

                // Only one merger per row traversal?
                if (next && next.value === tile.value && !next.mergedFrom) {
                    merged = new Tile(positions.next, tile.value * 2);
                    merged.mergedFrom = [tile, next];

                    self.insertTile(merged);
                    self.removeTile(tile);

                    // Converge the two tiles' positions
                    tile.updatePosition(positions.next);

                    // Update the score
                    score += merged.value;

                    // The mighty 2048 tile
                    if (merged.value === 2048) {
                        won = true;
                    }
                } else {
                    //if (debug) {
                    //console.log(cell);
                    //console.log(tile);
                    //}
                    self.moveTile(tile, positions.farthest);
                }

                if (!self.positionsEqual(cell, tile)) {
                    self.playerTurn = false;
                    //console.log('setting player turn to ', self.playerTurn);
                    moved = true; // The tile moved from its original cell!
                }
            }
        });
    });

    return {
        moved: moved,
        score: score,
        won: won
    };
};

Grid.prototype.computerMove = function (pos, value) {

    this.prepareTiles();
    this.insertTile(new Tile(pos, value));
    this.playerTurn = true;
};

// Build a list of positions to traverse in the right order
Grid.prototype.buildTraversals = function (vector) {

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

Grid.prototype.findFarthestPosition = function (cell, vector) {

    var previous;

    // Progress towards the vector direction until an obstacle is found
    do {
        previous = cell;
        cell = {
            x: previous.x + vector.x,
            y: previous.y + vector.y
        };
    } while (this.withinBounds(cell) &&
        this.cellAvailable(cell));

    return {
        farthest: previous,
        next: cell // Used to check if a merge is required
    };
};

Grid.prototype.movesAvailable = function () {

    return this.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
// returns the number of matches
Grid.prototype.tileMatchesAvailable = function () {

    var self = this,
        tile,
        x,
        y,
        direction,
        vector,
        cell,
        other;

    for (x = 0; x < this.size; x += 1) {
        for (y = 0; y < this.size; y += 1) {
            tile = this.cellContent({
                x: x,
                y: y
            });

            if (tile) {
                for (direction = 0; direction < 4; direction += 1) {
                    vector = self.getVector(direction);
                    cell = {
                        x: x + vector.x,
                        y: y + vector.y
                    };

                    other = self.cellContent(cell);

                    if (other && other.value === tile.value) {
                        return true; //matches += 1; // These two tiles can be merged
                    }
                }
            }
        }
    }

    //console.log(matches);
    return false; //matches;
};

Grid.prototype.positionsEqual = function (first, second) {

    return first.x === second.x && first.y === second.y;
};

Grid.prototype.toString = function () {

    var string = '',
        i,
        j;
    for (i = 0; i < 4; i += 1) {
        for (j = 0; j < 4; j += 1) {
            if (this.cells[j][i]) {
                string += this.cells[j][i].value + ' ';
            } else {
                string += '_ ';
            }
        }
        string += '\n';
    }
    return string;
};

// counts the number of isolated groups. 
Grid.prototype.islands = function () {

    var self = this,
        mark = function (x, y, value) {
            var direction, vector;
            if (x >= 0 && x <= 3 && y >= 0 && y <= 3 && self.cells[x][y] && self.cells[x][y].value === value && !self.cells[x][y].marked) {
                self.cells[x][y].marked = true;

                for (direction = 0; direction < 4; direction += 1) {
                    vector = self.getVector(direction);
                    mark(x + vector.x, y + vector.y, value);
                }
            }
        },
        islands = 0,
        x,
        y;

    for (x = 0; x < 4; x += 1) {
        for (y = 0; y < 4; y += 1) {
            if (this.cells[x][y]) {
                this.cells[x][y].marked = false;
            }
        }
    }
    for (x = 0; x < 4; x += 1) {
        for (y = 0; y < 4; y += 1) {
            if (this.cells[x][y] && !this.cells[x][y].marked) {
                islands += 1;
                mark({
                    x: x,
                    y: y
                }, this.cells[x][y].value);
            }
        }
    }

    return islands;
};


// measures how smooth the grid is (as if the values of the pieces
// were interpreted as elevations). Sums of the pairwise difference
// between neighboring tiles (in log space, so it represents the
// number of merges that need to happen before they can merge). 
// Note that the pieces can be distant
Grid.prototype.smoothness = function () {

    var smoothness = 0,
        x,
        y,
        value,
        direction,
        vector,
        targetCell,
        target,
        targetValue;
    for (x = 0; x < 4; x += 1) {
        for (y = 0; y < 4; y += 1) {
            if (this.cellOccupied(this.indexes[x][y])) {
                value = Math.log(this.cellContent(this.indexes[x][y]).value) / Math.log(2);
                for (direction = 1; direction <= 2; direction += 1) {
                    vector = this.getVector(direction);
                    targetCell = this.findFarthestPosition(this.indexes[x][y], vector).next;

                    if (this.cellOccupied(targetCell)) {
                        target = this.cellContent(targetCell);
                        targetValue = Math.log(target.value) / Math.log(2);
                        smoothness -= Math.abs(value - targetValue);
                    }
                }
            }
        }
    }
    return smoothness;
};

Grid.prototype.monotonicity = function () {

    var self = this,
        marked = [],
        queued = [],
        highestValue = 0,
        highestCell = {
            x: 0,
            y: 0
        },
        x,
        y;
    for (x = 0; x < 4; x += 1) {
        marked.push([]);
        queued.push([]);
        for (y = 0; y < 4; y += 1) {
            marked[x].push(false);
            queued[x].push(false);
            if (this.cells[x][y] && this.cells[x][y].value > highestValue) {
                highestValue = this.cells[x][y].value;
                highestCell.x = x;
                highestCell.y = y;
            }
        }
    }
    var increases = 0,
        cellQueue = [highestCell],
        markList = [highestCell],
        markAfter = 1,
        markAndScore = function (cell) {
            var direction, value, vector, target, targetValue, cel;
            markList.push(cell);
            if (self.cellOccupied(cell)) {
                value = Math.log(self.cellContent(cell).value) / Math.log(2);
            } else {
                value = 0;
            }
            for (direction = 0; direction < 4; direction += 1) {
                vector = self.getVector(direction);
                target = {
                    x: cell.x + vector.x,
                    y: cell.y + vector.y
                };
                if (self.withinBounds(target) && !marked[target.x][target.y]) {
                    if (self.cellOccupied(target)) {
                        targetValue = Math.log(self.cellContent(target).value) / Math.log(2);
                        if (targetValue > value) {
                            //console.log(cell, value, target, targetValue);
                            increases += targetValue - value;
                        }
                    }
                    if (!queued[target.x][target.y]) {
                        cellQueue.push(target);
                        queued[target.x][target.y] = true;
                    }
                }
            }
            if (markAfter === 0) {
                while (markList.length > 0) {
                    cel = markList.pop();
                    marked[cel.x][cel.y] = true;
                }
                markAfter = cellQueue.length;
            }
        };
    queued[highestCell.x][highestCell.y] = true;

    while (cellQueue.length > 0) {
        markAfter -= 1;
        markAndScore(cellQueue.shift());
    }

    return -increases;
};

// measures how monotonic the grid is. This means the values of the tiles are strictly increasing
// or decreasing in both the left/right and up/down directions
Grid.prototype.monotonicity2 = function () {
    // scores for all four directions

    var totals = [0, 0, 0, 0],
        x,
        y,
        current,
        next,
        currentValue,
        nextValue;

    // up/down direction
    for (x = 0; x < 4; x += 1) {
        current = 0;
        next = current + 1;
        while (next < 4) {
            while (next < 4 && !this.cellOccupied(this.indexes[x][next])) {
                next += 1;
            }
            if (next >= 4) {
                next -= 1;
            }
            currentValue = this.cellOccupied({
                x: x,
                y: current
            }) ? Math.log(this.cellContent(this.indexes[x][current]).value) / Math.log(2) : 0;
            nextValue = this.cellOccupied({
                x: x,
                y: next
            }) ? Math.log(this.cellContent(this.indexes[x][next]).value) / Math.log(2) : 0;
            if (currentValue > nextValue) {
                totals[0] += nextValue - currentValue;
            } else if (nextValue > currentValue) {
                totals[1] += currentValue - nextValue;
            }
            current = next;
            next += 1;
        }
    }

    // left/right direction
    for (y = 0; y < 4; y += 1) {
        current = 0;
        next = current + 1;
        while (next < 4) {
            while (next < 4 && !this.cellOccupied(this.indexes[next][y])) {
                next += 1;
            }
            if (next >= 4) {
                next -= 1;
            }
            currentValue = this.cellOccupied({
                x: current,
                y: y
            }) ? Math.log(this.cellContent(this.indexes[current][y]).value) / Math.log(2) : 0;
            nextValue = this.cellOccupied({
                x: next,
                y: y
            }) ? Math.log(this.cellContent(this.indexes[next][y]).value) / Math.log(2) : 0;
            if (currentValue > nextValue) {
                totals[2] += nextValue - currentValue;
            } else if (nextValue > currentValue) {
                totals[3] += currentValue - nextValue;
            }
            current = next;
            next += 1;
        }
    }

    return Math.max(totals[0], totals[1]) + Math.max(totals[2], totals[3]);
};

Grid.prototype.maxValue = function () {

    var max = 0,
        x,
        y,
        value;
    for (x = 0; x < 4; x += 1) {
        for (y = 0; y < 4; y += 1) {
            if (this.cellOccupied(this.indexes[x][y])) {
                value = this.cellContent(this.indexes[x][y]).value;
                if (value > max) {
                    max = value;
                }
            }
        }
    }

    return Math.log(max) / Math.log(2);
};

// check for win
Grid.prototype.isWin = function () {

    var self = this,
        x,
        y;
    for (x = 0; x < 4; x += 1) {
        for (y = 0; y < 4; y += 1) {
            if (self.cellOccupied(this.indexes[x][y])) {
                if (self.cellContent(this.indexes[x][y]).value === 2048) {
                    return true;
                }
            }
        }
    }
    return false;
};

function GameManager(size, InputManager, Actuator) {

    this.size = size; // Size of the grid
    this.inputManager = new InputManager();
    this.actuator = new Actuator();

    this.inputManager.on("move", this.move.bind(this));
    this.inputManager.on("restart", this.restart.bind(this));
    this.inputManager.on("difficulty", this.difficulty.bind(this));

    this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {

    this.actuator.restart();
    this.setup();
};

// Set up the game
GameManager.prototype.setup = function () {

    this.grid = new Grid(this.size);
    this.grid.addStartTiles();

    this.ai = new AI(this.grid, 3);
    this.score = 0;
    this.over = false;
    this.won = false;

    // Update the actuator
    this.actuate();
};


// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {

    this.actuator.actuate(this.grid, {
        score: this.score,
        over: this.over,
        won: this.won
    });
};

GameManager.prototype.aimove = function () {

    var best = this.ai.getBest(),
        result = this.grid.move(best.move);
    this.score += result.score;

    if (result.won) {
        this.won = true;
    }

    this.actuate();
};

GameManager.prototype.difficulty = function (depth) {

    this.ai.depth = depth;
};

// makes a given move and updates state
GameManager.prototype.move = function (pos) {

    if (this.grid.cellOccupied(pos)) {
        return;
    }
    this.grid.computerMove(pos, pos.value);
    if (!this.grid.movesAvailable()) {
        this.over = true; // Game over!
    }
    this.actuate();
    var self = this;
    setTimeout(function () {
        self.aimove();
    }, 0);
};