// INPUT:  board -> [RxC] multidimensional array with each element being either 
//                  "null" (empty space), 
//                  "P"    (your piece), 
//                  "C"    (opponent piece)
// OUTPUT: 1, 2, 3, 4, 5, 6, 7 signifying the column to drop piece
function deep_copy(a) { return a.map(function(i){return i.slice()}); }
function init(len) { 
    var prongs = Array.apply(null, Array(len)).map(function (_, i) {return i+1;}), 
        i=prongs.length, r, item;
    while (0 !== i) {
        r = Math.floor(Math.random() * i);
        i -= 1;
        item = prongs[i];
        prongs[i] = prongs[r];
        prongs[r] = item;
    } return prongs;
}
function valid(board,dir) { return dir>0 && dir-1<(board[0].length) && board[0][dir-1] === "null"; }
function possible(board) { return init(board[0].length).filter(function(dir) { return valid(board,dir); }); }
function counter(board,start,step) {
    var acc = [0,0,0], i, piece; //"null","P","C" counters
    for (i=0; i<4; i++) {
        piece = board[start[0]+i*step[0]][start[1]+i*step[1]];
        if (piece==="P") {        acc[1]++;
        } else if (piece==="C") { acc[2]++;
        } else {                  acc[0]++; }
    }
    return acc;
}
function Win(board) {
    var row, col, pieces;
    for (row=0; row<(board.length); row++) {
        for (col=0; col+3<(board[row].length); col++) {
            pieces = counter(board,[row,col],[0,1]);
            if (pieces[1]===4 || pieces[2]===4) { return board[row][col]; }
        }
    }
    for (row=0; row+3<(board.length); row++) {
        for (col=0; col<(board[row].length); col++) {
            pieces = counter(board,[row,col],[1,0]);
            if (pieces[1]===4 || pieces[2]===4) { return board[row][col]; }
        }
    }
    for (row=3; row<(board.length); row++) {
        for (col=0; col+3<(board[row].length); col++) {
            pieces = counter(board,[row,col],[-1,1]);
            if (pieces[1]===4 || pieces[2]===4) { return board[row][col]; }
        }
    }
    for (row=0; row+3<(board.length); row++) {
        for (col=0; col+3<(board[row].length); col++) {
            pieces = counter(board,[row,col],[1,1]);
            if (pieces[1]===4 || pieces[2]===4) { return board[row][col]; }
        }
    }
    return false;
}
function move(board,dir,piece) {
    var i=board.length-1;
    while (i>=0 && board[i][dir-1]!=="null") { i--; }
    if (i<0) return false;
    var newBoard=deep_copy(board);
    newBoard[i][dir-1] = piece;
    return newBoard;
}
function _score(pieces) {
    if (pieces[1]===4) { return 1000; }
    if (pieces[2]===4) { return -1000; }
    if (pieces[0]===1) {
        if (pieces[1]===3) {        return 50; 
        } else if (pieces[2]===3) { return -50; }
    } else if (pieces[0]===2) {
        if (pieces[1]===2) {        return 10; 
        } else if (pieces[2]===2) { return -10; }
    }
	return 0;
}
function score(board) {
    var row, col, num, acc=0;
    for (row=0; row<(board.length); row++) {
        for (col=0; col+3<(board[row].length); col++) {
            num = _score(counter(board,[row,col],[0,1]));
            if (Math.abs(num)>500) return num;
            acc += num;
        }
    }
    for (row=0; row+3<(board.length); row++) {
        for (col=0; col<(board[row].length); col++) {
            num = _score(counter(board,[row,col],[1,0]));
            if (Math.abs(num)>500) return num;
            acc += num;
        }
    }
    for (row=3; row<(board.length); row++) {
        for (col=0; col+3<(board[row].length); col++) {
            num = _score(counter(board,[row,col],[-1,1]));
            if (Math.abs(num)>500) return num;
            acc += num;
        }
    }
    for (row=0; row+3<(board.length); row++) {
        for (col=0; col+3<(board[row].length); col++) {
            num = _score(counter(board,[row,col],[1,1]));
            if (Math.abs(num)>500) return num;
            acc += num;
        }
    }
    return acc;
}
function minimax(board,maxNode,minOfMaxes,maxOfMins,depth) {
    if (depth===0 || Win(board)) { return (depth+1)*score(board); }
    var moves = possible(board);
    moves.every(function(dir){
        var propogated = minimax(move(board,dir,maxNode?"P":"C"),!maxNode,minOfMaxes,maxOfMins,depth-1);
        
        if (maxNode) {//Raises the minimum
            if (propogated>minOfMaxes) { minOfMaxes = propogated; }
        } else {//Lowers the maximum
            if (maxOfMins>propogated) { maxOfMins = propogated; }
        }
        
        return maxOfMins>minOfMaxes;
    });
    
    return maxNode?minOfMaxes:maxOfMins;
}

function bot(board) {
    var moves = possible(board),
        Scores = moves.map(function(dir){ return minimax(move(board,dir,"P"),false,-2000,2000,6); }),
        maxScore = Math.max.apply(Math,Scores);
    console.log(moves);
    console.log(Scores);    
    return moves.filter(function(dir, ind){ return Scores[ind]===maxScore; })[0];
}

bot(readline());