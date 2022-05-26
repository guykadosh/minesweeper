'use strict'

const BOARD_SIZE = 14
const ALIENS_ROW_LENGTH = 8
const ALIENS_ROW_COUNT = 3
const HERO = '♆'
const ALIEN = '👽'
const LASER = '⤊'
const SKY = 'SKY'
const EARTH = 'EARTH'
const SUPER_LASER = '^'

var gScore

var gElScore


// Matrix of cell objects. e.g.: {type: SKY, gameObject: ALIEN} 
var gBoard
var gGame = {
    isOn: false,
    aliensCount: 0
}

// Called when game loads 
function init() {

    gBoard = createBoard()
    gScore = 0

    gGame.aliensCount = ALIENS_ROW_COUNT * ALIENS_ROW_LENGTH



    gElScore = document.querySelector('h3 span')
    gElScore.innerText = gScore

    renderBoard(gBoard)

    if (!gGame.isOn) return
    moveAliens()


}
// Create and returns the board with aliens on top, ground at bottom 
// use the functions: createCell, createHero, createAliens 
function createBoard() {
    var board = []

    for (var i = 0; i < BOARD_SIZE; i++) {
        board.push([])
        for (var j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = createCell()
            if (i >= BOARD_SIZE - 2) board[i][j].type = EARTH
        }
    }

    createHero(board)
    createAliens(board)

    return board
}


// Render the board as a <table> to the page 
function renderBoard(board) {

    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            var className = `cell cell-${i}-${j}`
            if (i === board.length - 1) className += ' ground'
            cell.gameObject = (!cell.gameObject) ? '' : cell.gameObject
            strHTML += `<td class="${className}"> ${cell.gameObject} </td>\n`
        }
        strHTML += '</tr>\n'
    }
    strHTML += '</tbody></table>'

    var elContainer = document.querySelector('.board-container')
    elContainer.innerHTML = strHTML
}

// Returns a new cell object. e.g.: {type: SKY, gameObject: ALIEN} 
function createCell(gameObject = null) {
    return {
        type: SKY,
        gameObject: gameObject
    }
}

// position such as: {i: 2, j: 7} 
function updateCell(pos, gameObject = null) {
    gBoard[pos.i][pos.j].gameObject = gameObject
    var elCell = getElCell(pos)
    elCell.innerHTML = gameObject || ''
}

function updateScore(diff) {
    gScore += diff

    gElScore.innerText = gScore
}

function isVictory() {
    return (gGame.aliensCount === 0)
}

function gameOver(isVictory) {

    var elModalHeader = document.querySelector('.modal h1')
    if (isVictory) elModalHeader.innerText = 'You Won!'
    else elModalHeader.innerText = 'You Lost!'

    var elModal = document.querySelector('.modal')
    elModal.style.display = 'block'

}

function restartGame() {
    var elModal = document.querySelector('.modal')
    elModal.style.display = 'none'

    clearInterval(gIntervalAliensRight)
    clearInterval(gIntervalAliensLeft)
    clearInterval(gIntervalAliensDown)

    gGame.isOn = true

    init()
}

