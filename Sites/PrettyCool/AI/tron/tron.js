
// INPUT:  board   -> [RxC] multidimensional array with each element being either 
//                    "null" (empty space), 
//                    "P"    (your aLoc)
//                    "C"    (bLoconent aLoc),
//                    "XP"   (visited space by your aLoc),
//                    "XC"   (visited space by bLoconent aLoc) 
//         aLoc_loc -> [r,c] where r=row and c=col of your aLoc on board
//         bLoc_loc -> [r,c] where r=row and c=col of bLoconent on board    
// OUTPUT: N, E, S, W which signifies which direction to move 

function copy(a) { return a.slice(); }
function deep_copy(a) { return a.map(function(i) { return i.slice(); }); }
function init() { //Randomize initialization of 4 directions
	var prongs = ["N", "S", "E", "W"],
		i = prongs.length,
		r, item;
	while (0 !== i) {
		r = Math.floor(Math.random() * i);
		i -= 1;
		item = prongs[i];
		prongs[i] = prongs[r];
		prongs[r] = item;
	}
	return prongs;
}
function in_bounds(board, loc) { return board[loc[0]] !== undefined && board[loc[0]][loc[1]] !== undefined; }
function valid(board, loc) { return in_bounds(board, loc) && !board[loc[0]][loc[1]].startsWith('X'); }
function move(dir, loc) { //create the new location of a move
	var loc_copy = copy(loc);
	if (dir === "N") {
		loc_copy[0] -= 1;
	} else if (dir === "S") {
		loc_copy[0] += 1;
	} else if (dir === "E") {
		loc_copy[1] += 1;
	} else if (dir === "W") {
		loc_copy[1] -= 1;
	}
	return loc_copy;
}
function makeMove(board, dir, loc) { //Actually make the move on a copy of the board, return board and new location
	var newLoc = move(dir, loc),
		newBoard,
		sym;
	if (!valid(board, newLoc)) {
		return false;
	}
	newBoard = deep_copy(board);
	sym = newBoard[loc[0]][loc[1]];
	newBoard[loc[0]][loc[1]] = "X" + sym;
	newBoard[newLoc[0]][newLoc[1]] = sym;
	return [newBoard, newLoc];
}
function places(board, loc) { return init().filter(function(dir) { return valid(board, move(dir, loc)); }); }
function minMag(board, loc) { //part of fill algorithm. gives amounts according to neighbors
	var num = Math.abs(board[loc[0]][loc[1]]), //central number start
		sign = 0, //sign of directions accumulated
		acc = Infinity, //magnitude of the accumulated (downward accumulate)
		tLoc,
		temp,
		boundary = false; //boundary is where negative and positive signs will cancel
	["N", "S", "E", "W"].forEach(function(dir) {
		tLoc = move(dir, loc); //"make move"
			if (in_bounds(board, tLoc)) {
				temp = board[tLoc[0]][tLoc[1]];//number on the board
				if (temp === 0) { //zeroes are kept
					return;
				}
				if (acc > Math.abs(temp)) { //if smaller than accumulator
					acc = Math.abs(temp);
					sign = temp / acc;
					boundary = false;
				} else if (temp === -sign * acc) { //boundary found
					boundary = true;
				}
			}
		});
	if (boundary) { //boundaries are always 0 (belong to no one)
		return 0;
	}
	if (num > acc) { //return accumulated stuff if center is bigger than accumulated
		return sign * (acc + 1) || board[loc[0]][loc[1]];
	} else { //leave billy alone
		return board[loc[0]][loc[1]];
		
	}
}
function fillInit(board, aLoc, bLoc, first) { //Initialization of fill algorithm
	var daLoc = first ? aLoc : bLoc;
	board = deep_copy(board); //who gest first move? it changes outcome believe you me
	places(board, daLoc).forEach(function(m) {
		var tempLoc = move(m, daLoc);
		board[tempLoc[0]][tempLoc[1]] = first ? 1 : -1;
	});
	board = board.map(function(row) { //change data to numbers
		return row.map(function(data) {
			return data === "null" ? Infinity : data;
		});
	});
	board[aLoc[0]][aLoc[1]] = first ? 0 : 1; //initialize positions
	board[bLoc[0]][bLoc[1]] = first ? -1 : 0; //if goes first ur not in ur spot anymore
	return board;
}
function fill(board) { //how many moves away everyone is from the thing
	var changed, temp,
		fun = function(row, ri) {
			return row.map(function(data, di) {
				if (typeof data === "number") {
					if (!changed) {
						temp = minMag(board, [ri, di]);
						if (board[ri][di] !== temp) {
							changed = true;
							return temp;
						}
					} else {
						return minMag(board, [ri, di]);
					}
				}
				return data;
			});
		};
	do {
		changed = false;
		board = board.map(fun);
	} while (changed);
	return board;
}
function scorer(board, aLoc, bLoc, first) { //get the score using hte fill algorithm
	var aS = 0, bS = 0;
	fill(fillInit(board, aLoc, bLoc, first)).forEach(function(row) {
		row.forEach(function(data) {
			if (data === Infinity) { return; }
			if (data > 0) { aS += 1; }
			if (0 > data) { bS += 1; }
		});
	});
	
	return aS-bS;
}

function minimax(board, maxNode, minOfMaxes, maxOfMins, depth, aLoc, bLoc, score) { //Amazeballs minimax. prettty standard stuff.
	if (depth === 0) { return score(board, aLoc, bLoc, maxNode); }
	var moves = places(board, maxNode ? aLoc : bLoc); //get possible moves
	if (moves.length===0) { return (depth+1) * score(board, aLoc, bLoc, maxNode); }
	
	moves.every(function(dir) { 
		var newBoard = makeMove(board, dir, maxNode ? aLoc : bLoc),
			newALoc = maxNode ? newBoard[1] : aLoc,
			newBLoc = maxNode ? bLoc : newBoard[1],
			propogated;  //make new board state
		newBoard = newBoard[0];
		propogated = minimax(newBoard, !maxNode, minOfMaxes, maxOfMins, depth - 1, newALoc, newBLoc, score); //excecute lower levels minimax

		if (maxNode) { //regular alpha beta pruning
			if (propogated > minOfMaxes) { //raise minimum
				minOfMaxes = propogated; //only maxnodes can edit lower bound
			}
		} else {
			if (maxOfMins > propogated) { //lower maximum
				maxOfMins = propogated; //only minnodes can edit top boundary
			}
		}
		return maxOfMins > minOfMaxes; //if min>max ur screwd. lol nah. that just means the sub tree is pruned
	});

	return maxNode ? minOfMaxes : maxOfMins;
}

function sendMove(board,goodMoves) {
    if (0 < goodMoves.length) {
	    return goodMoves[0];
    } else { if (board[15][7]==="XP") { while (1) {} } }
}

function bot(board, aLoc, bLoc) {
	var moves = places(board, aLoc), 
	Scores, 
	maxScore, 
	goodMoves, 
	minimaxon = scorer, 
	amount = 6;
	
	Scores = moves.map(function(dir) {
		var newBoard = makeMove(board, dir, aLoc),
			newALoc = newBoard[1];
		newBoard = newBoard[0];
		return minimax(newBoard, false, -Infinity, Infinity, amount, newALoc, bLoc, minimaxon);
	});
	maxScore = Math.max.apply(Math, Scores);
	goodMoves = moves.filter(function(dir, ind) {
		return Scores[ind] === maxScore;
	});
	if (2 > goodMoves.length) { return sendMove(board,goodMoves); }
	
	Scores = goodMoves.map(function(dir) {
		var newLoc = move(dir, aLoc);
		return ["N", "S", "E", "W"].filter(function(dir) {
			return !valid(board, move(dir, newLoc));
		}).length;
	});
	maxScore = Math.max.apply(Math, Scores);
	goodMoves = goodMoves.filter(function(dir, ind) {
		return Scores[ind] === maxScore;
	});
	return sendMove(board,goodMoves);
}

bot(readline());            