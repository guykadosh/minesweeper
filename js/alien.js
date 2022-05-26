'use strict'

const ALIEN_SPEED = 500

var gIntervalAliens
var gIntervalAliensRight
var gIntervalAliensLeft
var gIntervalAliensDown

// The following two variables represent the part of the matrix (some rows) 
// that we should shift (left, right, and bottom) // 
// We need to update those when: // 
// (1) shifting down and (2) last alien was cleared from row 

var gAliensTopRowIdx = 0
var gAliensBottomRowIdx = ALIENS_ROW_COUNT - 1

var gIsAlienFreeze = false

var gCanShiftRight = true
var gCanShiftDown = false

function createAliens(board) {
    for (var i = 0; i < ALIENS_ROW_COUNT; i++) {
        for (var j = 0; j < ALIENS_ROW_LENGTH; j++) {
            board[i][j] = { type: SKY, gameObject: ALIEN }
        }
    }
}

function handleAlienHit(pos) {

}

function shiftBoardRight(board, fromI, toI) {
    if (!gCanShiftRight) {
        return
    }
    console.log('from shift right fun: fromI,toI:', fromI, toI)


    var oldBoard = copyBoard(board)

    for (var i = fromI; i <= toI; i++) {
        for (var j = 0; j < board[0].length; j++) {
            // stop moving right - when an alien in the last board column
            if (board[i][board[0].length - 1].gameObject === ALIEN) {
                // gCanShiftRight = false
                gCanShiftDown = (gCanShiftDown) ? false : true
                return
            }
            // cells in first column should be with gameObject = null
            board[i][j] = (j === 0) ? createCell() : oldBoard[i][j - 1]
        }
    }
    renderBoard(board)
}

function shiftBoardLeft(board, fromI, toI) {
    if (gCanShiftRight) return
    console.log('shift left func: fromI,toI:', fromI, toI)
    var oldBoard = copyBoard(board)

    for (var i = fromI; i <= toI + 1; i++) {
        for (var j = board[0].length - 1; j >= 0; j--) {
            // // stop moving left - when an alien in the first board column
            if (board[i][0].gameObject === ALIEN) {
                // gCanShiftRight = true
                gCanShiftDown = (gCanShiftDown) ? false : true
                return
            }
            // cells in last column should be with gameObject = null
            board[i][j] = (j === board[0].length - 1) ? createCell() : oldBoard[i][j + 1]
        }
    }
    renderBoard(board)
}

function shiftBoardDown(board, fromI, toI) {

    if (!gCanShiftDown) return

    var newBoard = copyBoard(board)

    console.log('from shift down fun: fromI,toI:', fromI, toI)
    console.log('gAliensTopRowIdx,gAliensBottomRowIdx:', gAliensTopRowIdx, gAliensBottomRowIdx)

    for (var i = fromI; i <= toI + 1; i++) {
        for (var j = 0; j < board[0].length; j++) {
            newBoard[i][j] = (i === 0) ? createCell() : board[i - 1][j]
        }
    }



    // var oldBoard = copyBoard(board)
    // console.log('oldBoard:', oldBoard)

    // for (var i = fromI; i <= toI + 1; i++) {

    //     for (var j = 0; j <= oldBoard[0].length - 1; j++) {
    //         // if (board[i][j].gameObject === HERO) continue
    //         board[i][j] = (i === 0) ? createCell() : oldBoard[i - 1][j]
    //     }
    // }
    gAliensTopRowIdx++
    gAliensBottomRowIdx++

    renderBoard(newBoard)

    gCanShiftRight = (gCanShiftRight) ? false : true
    // gCanShiftLeft =  (gCanShiftLeft) ? false : true
    gCanShiftDown = false
}

// runs the interval for moving aliens side to side and down
// it re-renders the board every time // 
// when the aliens are reaching the hero row - interval stops 
function moveAliens() {
    if (gIsAlienFreeze) return

    gIntervalAliensDown = setInterval(shiftBoardDown, ALIEN_SPEED, gBoard, gAliensTopRowIdx, gAliensBottomRowIdx)
    gIntervalAliensRight = setInterval(shiftBoardRight, ALIEN_SPEED, gBoard, gAliensTopRowIdx, gAliensBottomRowIdx)
    gIntervalAliensLeft = setInterval(shiftBoardLeft, ALIEN_SPEED, gBoard, gAliensTopRowIdx, gAliensBottomRowIdx)
}