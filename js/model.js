'use strict';

// Model - Global variables
const INSANE_SIZE = 30;

// Game state
const gGame = {
  isOn: false,
  isOver: false,
  shownCount: 0,
  markedCount: 0,
  livesCount: 3,
  hintsCount: 3,
  isHintOn: false,
  safeCount: 3,
  moves: [],
  isManual: false,
  manualMinesCount: 0,
  is7Boom: false,
  scale: 100,
};

// Score variables
var gBestTimeBeginner = +localStorage.getItem('bestTimeBeginner');
var gBestTimeMedium = +localStorage.getItem('bestTimeMedium');
var gBestTimeExpert = +localStorage.getItem('bestTimeExpert');
var gBestTimeInsane = +localStorage.getItem('bestTimeInsane');
var gStartTime, gEndTime;

var gBoard;
var gInterval;

const gLevel = {
  SIZE: 4,
  MINES: 2,
  INSANE: 16,
};

// Model - functions

// Builds the board
function buildBoard() {
  // Checks if insane mode then 30*16
  const board =
    gLevel.SIZE === INSANE_SIZE
      ? createMat(gLevel.INSANE, gLevel.SIZE)
      : createMat(gLevel.SIZE);

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      const cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
      board[i][j] = cell;
    }
  }
  return board;
}

// Set mines at random places with given mine count
function setMines(board, minesCount, location) {
  for (var i = 0; i < minesCount; i++) {
    // case insane mode not a square
    var idxRow =
      gLevel.SIZE === INSANE_SIZE
        ? getRandomIntInc(0, gLevel.INSANE - 1)
        : getRandomIntInc(0, gLevel.SIZE - 1);
    var idxColumn = getRandomIntInc(0, gLevel.SIZE - 1);
    if (
      board[idxRow][idxColumn].isMine ||
      (idxRow == location.i && idxColumn === location.j)
    ) {
      i--;
      continue;
    }

    board[idxRow][idxColumn].isMine = true;
  }
}

// Count mines around each cell
// and set the cell's
// minesAroundCount
function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      if (board[i][j].isMine) continue;

      board[i][j].minesAroundCount = getMinesAroundCounts(board, i, j);
    }
  }
}

// Set mines on board on 7 boom mode
function set7BoomMines(board) {
  var count = 0;
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      if (count !== 0 && (count % 7 === 0 || (count + '').includes('7'))) {
        gBoard[i][j].isMine = true;
      }
      count++;
    }
  }
}

// Changes board size by picked level by user
function changeBoard(elBtn) {
  if (gLevel.SIZE === +elBtn.dataset.level) return;
  gLevel.SIZE = +elBtn.dataset.level;

  // Place mines count
  switch (gLevel.SIZE) {
    case 4:
      gLevel.MINES = 2;
      break;
    case 8:
      gLevel.MINES = 12;
      break;
    case 12:
      gLevel.MINES = 30;
      break;
    case 30:
      gLevel.MINES = 99;
      break;
  }

  initGame();
}
