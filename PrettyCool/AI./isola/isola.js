// INPUT:  board   -> [RxC] multidimensional array with each element being either 
//                    "null" (empty space), 
//                    "P"    (your bot)
//                    "C"    (opponent bot),
//                    "X"    (visited space)
//         bot_loc -> [r,c] where r=row and c=col of your bot on board
//         opp_loc -> [r,c] where r=row and c=col of opponent on board    
// OUTPUT: N, NE, E, SE, S, SW, W, NW which signifies which direction to move 
function copy(a) { return a.slice(); }
function deep_copy(a) { return a.map(function(i){return i.slice()}); }
function init() { 
    var prongs = ["N","S","E","W","NE","NW","SE","SW"], i=prongs.length, r, item;
    while (0 !== i) {
        r = Math.floor(Math.random() * i);
        i -= 1;
        item = prongs[i];
        prongs[i] = prongs[r];
        prongs[r] = item;
    } return prongs;
}

function in_bounds(board, loc) { return board[loc[0]]!==undefined && board[loc[0]][loc[1]]!==undefined; }
function valid(board,loc) { return in_bounds(board,loc) && board[loc[0]][loc[1]]==="null"; }
function move(dir, loc) {
	if (dir===undefined) return loc;
    var loc_copy = copy(loc);
    if (dir.includes("N")) {        loc_copy[0]--;
    } else if (dir.includes("S")) { loc_copy[0]++;
    }
    if (dir.includes("E")) { loc_copy[1]++;
    } else if (dir.includes("W")) { loc_copy[1]--;
    }
    return loc_copy;
}
function makeMove(board, dir, loc) {
    var newLoc = move(dir, loc), newBoard, sym;
    if (!valid(board, newLoc)) { return false; }
    newBoard = deep_copy(board);
    newBoard[newLoc[0]][newLoc[1]] = newBoard[loc[0]][loc[1]];
    newBoard[loc[0]][loc[1]] = "X";
    return [newBoard, newLoc];
}
function places(board, loc) { return init().filter(function(dir){ return valid(board,move(dir,loc)); }); }

function _MinMag(board, loc) {
    var num = Math.abs(board[loc[0]][loc[1]]), //magnitude of middle num
        sign = 0, //accumulated sign
        acc = Infinity, //accumulated magnitude
        tLoc, temp, //temp stuff
        boundary = false; //boundary found
    ["N","S","E","W","NE","NW","SE","SW"].forEach(function (dir) {
        tLoc = move(dir, loc); // location of movement
        if (in_bounds(board, tLoc)) { // move is in the board
            temp = board[tLoc[0]][tLoc[1]]; //number in movement
            if (temp === 0) return;
            if (Math.abs(temp) < acc) { // if that number has smaller magnitude than accumulator
                acc = Math.abs(temp); // set accumulator
                sign = temp / acc;
                boundary = false;
            } else if (temp === -sign * acc) { boundary = true; } // if that number is negation
        }
    });
    if (boundary) { return 0; }//Boundaries are 0
    if (num < acc) { return board[loc[0]][loc[1]]; //if the magnitude of the middle is smaller than the accumulated leave it alone;
    } else { return sign * (acc + 1) || board[loc[0]][loc[1]]; } //if NaN leave it alone, else return acumulated stuff
}

function fillInit(board, aLoc, bLoc) {
    board = board.map(function (row) { return row.map(function (data) { return data === "null" ? Infinity : data; }); });
    board[aLoc[0]][aLoc[1]] = 1;
    board[bLoc[0]][bLoc[1]] = -1; //newBoard with null -> ∞ and locations -> ±1
	return board;
}
function fill(board, aLoc, bLoc) {
    var temp, changed, 
		fun = function (row, ri) {
            row.forEach(function (data, di) {
                if (typeof data === "number") { //All numbers in matrix
                    if (!changed) { //Use temp first to check if changing
                        temp = _MinMag(board, [ri, di]);
                        if (board[ri][di] !== temp) { board[ri][di] = temp; changed = true; }
                    } else { board[ri][di] = _MinMag(board, [ri, di]); } //If already changed just set it directly
                }
            });
        };
    do {
        changed = false; //re initialize escape parameter
        board.forEach(fun);
    } while (changed);

    return board;
}

function score(board, aLoc, bLoc) {
    var aC = 0, bC = 0;
    fill(fillInit(board, aLoc, bLoc), aLoc, bLoc).forEach(function (row) {
        row.forEach(function (data) {
            if (data > 0) { aC++; }
            if (data < 0) { bC++; }
        });
    });
    return aC - bC;
}

function minimax(board, maxNode, minOfMaxes, maxOfMins, depth, aLoc, bLoc) {
    if (depth <= 0) { return (depth + 1) * score(board, aLoc, bLoc); }
    var moves = places(board, maxNode ? aLoc : bLoc);
    moves.every(function (dir) {
        var newBoard = makeMove(board, dir, maxNode ? aLoc : bLoc), //makeMove returns newBoard and new loc
            newALoc = maxNode ? newBoard[1] : aLoc,
            newBLoc = maxNode ? bLoc : newBoard[1];
        newBoard = newBoard[0];
        var propogated = minimax(newBoard, !maxNode, minOfMaxes, maxOfMins, depth - 1, newALoc, newBLoc);

        if (maxNode) { //Raises the minimum
            if (propogated > minOfMaxes) { minOfMaxes = propogated; }
        } else { //Lowers the maximum
            if (maxOfMins > propogated) { maxOfMins = propogated; }
        }

        return maxOfMins > minOfMaxes;
    });

    return maxNode ? minOfMaxes : maxOfMins;
}


function _hasNeighbor(board, loc) {
    return ["N","S","E","W","NE","NW","SE","SW"].some(function (dir) {
        tLoc = move(dir, loc); // location of movement
        return in_bounds(board, tLoc) && board[tLoc[0]][tLoc[1]] === 1;
    })?1:0;
}
function flood(board, aLoc) {
    board = board.map(function (row) { return row.map(function (data) { return data === "null" ? 0 : data; }); });
    board[aLoc[0]][aLoc[1]] = 1;
	
	var temp, changed, 
		fun = function (row, ri) {
	        row.forEach(function (data, di) {
	            if (typeof data === "number" && data!==1) { //All numbers in matrix
	                if (!changed) { //Use temp first to check if changing
	                    temp = _hasNeighbor(board, [ri, di]);
	                    if (board[ri][di] !== temp) { board[ri][di] = temp; changed = true; }
	                } else { board[ri][di] = _hasNeighbor(board, [ri, di]); } //If already changed just set it directly
	            }
	        });
	    };
	do {
	    changed = false; //re initialize escape parameter
	    board.forEach(fun);
	} while (changed);

	return board;
}
function floodAmount(board, loc) {
	var newBoard = flood(board,loc), counter=0;
	newBoard.forEach(function(row){ row.forEach(function(data){ if (data===1) counter++; }); });
	return counter;
}

function bot(board,aLoc,bLoc) {
	var num = 9-Math.floor(floodAmount(board,aLoc)/5),
		moves = places(board, aLoc),
	    Scores = moves.map(function (dir) {
	        var newBoard = makeMove(board, dir, aLoc), newALoc = newBoard[1]; newBoard = newBoard[0];
	        return minimax(newBoard, false, -Infinity, Infinity, 3+num, newALoc, bLoc);
	    }),
	    maxScore = Math.max.apply(Math, Scores),
		goodMoves = moves.filter(function (dir, ind) { return Scores[ind] === maxScore; });

	if (message.textContent.endsWith('move')) { message.innerHTML += '<br>'; } else { message.innerHTML = ''; }
	message.innerHTML += moves+'<br>'+Scores;
	
	if (goodMoves.length<2) return goodMoves[0];
	
	Scores = goodMoves.map(function(dir) { return floodAmount(board, move(dir,aLoc)); });
	maxScore = Math.max.apply(Math, Scores);
	goodMoves = goodMoves.filter(function (dir, ind) { return Scores[ind]===maxScore; });
	
	message.innerHTML += '<br><br>'+goodMoves+'<br>'+Scores;
	return goodMoves[0];
}

bot(readline());