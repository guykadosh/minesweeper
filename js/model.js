'use strict';

// Game state
const gGame = {
  isOn: false,
  isOver: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  livesCount: 3,
  hintsCount: 3,
  isHintOn: false,
  safeCount: 3,
  moves: [],
  isManual: false,
  manualMinesCount: 0,
  is7Boom: false,
};

var gBoard;
var gInterval;

const gLevel = {
  SIZE: 4,
  MINES: 2,
};

// Builds the board
function buildBoard() {
  const board = createMat(gLevel.SIZE);

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
function setMines(board, minesCount) {
  for (var i = 0; i < minesCount; i++) {
    var idxRow = getRandomIntInc(0, gLevel.SIZE - 1);
    var idxColumn = getRandomIntInc(0, gLevel.SIZE - 1);
    if (board[idxRow][idxColumn].isMine) {
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
  console.log(board);
}

// Changes board size by picked level by user
function changeBoard(elBtn) {
  console.log('clicked');
  if (gLevel.SIZE === +elBtn.dataset.level) return;
  console.log(elBtn.dataset.level);
  gLevel.SIZE = +elBtn.dataset.level;

  renderModeTitle('Normal Mode');

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
  }

  initGame();
}
