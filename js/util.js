'use strict'

// Returns a new cell object. e.g.: {type: SKY, gameObject: ALIEN} 
function createCell(gameObject = null) {
    return {
        type: SKY,
        gameObject: gameObject
    }
}

function getElCell(pos) {
    return document.querySelector(`.cell-${pos.i}-${pos.j}`)
}

function renderCell(pos, value) {
    var elCell = getElCell(pos)
    elCell.innerText = value
}

function copyBoard(board) {
    var newBoard = []
    for (var i = 0; i < board.length; i++) {
        newBoard[i] = []
        for (var j = 0; j < board[0].length; j++) {
            newBoard[i][j] = board[i][j]
        }
    }
    return newBoard
}

function copyPartBoard(board, fromI, toI) {
    var newBoard = []
    for (var i = fromI; i <= toI; i++) {
        newBoard[i] = []
        for (var j = 0; j < board[0].length; j++) {
            newBoard[i][j] = board[i][j]
        }
    }
    return newBoard
}