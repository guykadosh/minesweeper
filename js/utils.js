'use strict';

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

function getRandomIntInc(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getIdName(location) {
  var cellClass = 'cell-' + location.i + '-' + location.j;
  return cellClass;
}

function getCellCoord(strCellId) {
  var parts = strCellId.split('-');
  var coord = { i: +parts[1], j: +parts[2] };
  return coord;
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
    .substring(0, 3)}`;
}
