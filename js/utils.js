'use strict'

//////////////////////////////
/// Model & general Utils ///
////////////////////////////

// Create Mat in given size(a square if only 1 size)
function createMat(ROWS, COLS = ROWS) {
  let mat = []
  for (let i = 0; i < ROWS; i++) {
    let row = []
    for (let j = 0; j < COLS; j++) {
      row.push('')
    }
    mat.push(row)
  }
  return mat
}

// Counts neighbouring mines
function getMinesAroundCounts(board, rowIdx, colIdx) {
  let count = 0
  for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue

    for (let j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[i].length) continue
      if (i === rowIdx && j === colIdx) continue

      let currCell = board[i][j]
      if (currCell.isMine) count++
    }
  }

  return count
}

function getClassName(location) {
  let cellId = 'cell-' + location.i + '-' + location.j
  return cellId
}

function getCellCoord(strCellId) {
  let parts = strCellId.split('-')
  let coord = { i: +parts[1], j: +parts[2] }
  return coord
}

// Finding all the safe cells and returns a random safe cell's location'
function getSafeCellLoc() {
  const safeCells = []
  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard[0].length; j++) {
      if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
        safeCells.push({ i, j })
      }
    }
  }

  return safeCells[getRandomIntInc(0, safeCells.length - 1)]
}

// Padding '0' to a lonely digit.
function padTo2Digits(num) {
  return num.toString().padStart(2, '0')
}

// Converts milliseconds to a readable String
function convertMsToTime(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000)
  let minutes = Math.floor(seconds / 60)

  seconds = seconds % 60
  minutes = minutes % 60

  return `${padTo2Digits(minutes)}:${padTo2Digits(seconds)}:${(
    milliseconds % 1000
  )
    .toString()
    .substring(0, 3)
    .padStart(3, '0')}`
}

function getRandomIntInc(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min)
}
