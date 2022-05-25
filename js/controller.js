'use strict';

// This is called when page loads
function initGame() {
  gBoard = buildBoard();
  renderBoard(gBoard);

  clearInterval(gInterval);

  gGame.isOn = false;
  gGame.isOver = false;

  var elTimer = document.querySelector('.timer');
  elTimer.innerText = '00:00:00';

  const elGameState = document.querySelector('.game-state .icon');
  elGameState.innerHTML = ALIVE_ICON;
}

function startGame() {
  gGame.isOn = true;
  setMines(gBoard, gLevel.MINES);
  setMinesNegsCount(gBoard);
  startTimer();
}

// Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
  if (gGame.isOver) return;
  if (!gGame.isOn) startGame();

  var clickedCell = gBoard[i][j];

  if (clickedCell.isShown) return;

  if (clickedCell.isMine) {
  }

  // Update Model
  clickedCell.isShown = true;

  // Update DOM
  showCell(elCell, clickedCell);

  if (clickedCell.isMine) {
    gameOver();
    return;
  }

  if (clickedCell.minesAroundCount === 0) expandShown(gBoard, elCell, i, j);

  // Check if game Won
  if (checkGameOver()) {
    clearInterval(gInterval);
    gGame.isOver = true;
    gGame.isOn = false;
    const elGameState = document.querySelector('.game-state .icon');
    elGameState.innerHTML = WON_ICON;
  }
}

// Called on right click to mark a cell
function cellMarked(ev, elCell) {
  ev.preventDefault();

  if (!gGame.isOn) return;

  var coord = getCellCoord(elCell.id);
  var curCell = gBoard[coord.i][coord.j];

  if (curCell.isShown) return;

  if (curCell.isMarked) {
    curCell.isMarked = false;
    elCell.innerHTML = '';
    return;
  }

  // Update model
  curCell.isMarked = true;

  // Update DOM
  elCell.innerHTML = `<span style="color:#fff">${FLAG_ICON}</span>`;

  // Check if game Won
  if (checkGameOver()) {
    clearInterval(gInterval);
    gGame.isOver = true;
    gGame.isOn = false;
    const elGameState = document.querySelector('.game-state .icon');
    elGameState.innerHTML = WON_ICON;
  }
}

// Checks if user won the game
function checkGameOver() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var curCell = gBoard[i][j];
      if (
        (!curCell.isMarked && curCell.isMine) ||
        (!curCell.isShown && !curCell.isMine)
      ) {
        return false;
      }
    }
  }

  return true;
}

// When user clicks a cell with no
// mines around, we need to open
// not only that cell, but also its
// neighbors.

// TODO: BONUS: if you have the time
// later, try to work more like the
// real algorithm (see description
// at the Bonuses section below)
function expandShown(board, elCell, rowIdx, colIdx) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;

    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[i].length) continue;
      if (i === rowIdx && j === colIdx) continue;
      var currCell = board[i][j];

      var cellId = '#' + getIdName({ i, j });
      var nextElCell = document.querySelector(cellId);

      // if (currCell.minesAroundCount === 0 && !currCell.isShown) {
      //   expandShown(board, nextElCell, i, j);
      // }

      // Model
      currCell.isShown = true;

      // DOM
      showCell(nextElCell, currCell);
    }
  }
}

function gameOver() {
  // Model
  gGame.isOver = true;
  gGame.isOn = false;

  clearInterval(gInterval);

  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isShown) continue;

      // Model
      gBoard[i][j].isShown = true;

      // DOM
      var cellId = '#' + getIdName({ i, j });
      var elCell = document.querySelector(cellId);

      showCell(elCell, gBoard[i][j]);
    }
  }

  // DOM
  const elGameState = document.querySelector('.game-state .icon');
  elGameState.innerHTML = DEAD_ICON;
}

function startTimer() {
  // Clear if there is previous interval
  clearInterval(gInterval);

  // Milliseconds model
  var ms = 0;

  gInterval = setInterval(function () {
    // Update Model
    ms += 59;

    // Update DOM
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = convertMsToTime(ms);
  }, 59);
}
