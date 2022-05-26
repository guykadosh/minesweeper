'use strict';

//////////////////////////////
/// Model & general Utils ///
////////////////////////////

// Create Mat in given size(a square if only 1 size)
function createMat(ROWS, COLS = ROWS) {
  var mat = [];
  for (var i = 0; i < ROWS; i++) {
    var row = [];
    for (var j = 0; j < COLS; j++) {
      row.push('');
    }
    mat.push(row);
  }
  return mat;
}

// Counts neighbouring mines
function getMinesAroundCounts(board, rowIdx, colIdx) {
  var count = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;

    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[i].length) continue;
      if (i === rowIdx && j === colIdx) continue;

      var currCell = board[i][j];
      if (currCell.isMine) count++;
    }
  }

  return count;
}

function getIdName(location) {
  var cellId = 'cell-' + location.i + '-' + location.j;
  return cellId;
}

function getCellCoord(strCellId) {
  var parts = strCellId.split('-');
  var coord = { i: +parts[1], j: +parts[2] };
  return coord;
}

// Finding all the safe cells and returns a random safe cell's location'
function getSafeCellLoc() {
  const safeCells = [];
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (!gBoard[i][j].isMine) safeCells.push({ i, j });
    }
  }

  return safeCells[getRandomIntInc(0, safeCells.length - 1)];
}

// Padding '0' to a lonely digit.
function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

// Convers milliseconds to a readable String
function convertMsToTime(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  return `${padTo2Digits(minutes)}:${padTo2Digits(seconds)}:${(
    milliseconds % 1000
  )
    .toString()
    .substring(0, 3)
    .padStart(3, '0')}`;
}

function getRandomIntInc(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
