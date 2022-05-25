'use strict';

// This is called when page loads
function initGame() {
  gBoard = buildBoard();
  renderBoard(gBoard);

  clearInterval(gInterval);

  gGame.isOn = false;
  gGame.isOver = false;

  const elTimer = document.querySelector('.timer');
  elTimer.innerText = '00:00:00';

  renderGameState(ALIVE_ICON);

  gGame.livesCount = 3;
  renderLives();
}

// Start game on first move
function startGame(isManual = false) {
  gGame.isOn = true;
  if (!isManual) setMines(gBoard, gLevel.MINES);
  if (isManual) renderModeTitle('Costume Game Started');
  setMinesNegsCount(gBoard);
  startTimer();
}

// Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
  if (gGame.isOver) return;

  var clickedCell = gBoard[i][j];

  if (gGame.isManual) {
    // Model
    gGame.manualMinesCount--;
    clickedCell.isMine = true;

    // DOM
    showCell(elCell, clickedCell);
    // const elModeTitle = document.querySelector('.mode-title');
    // elModeTitle.innerText = `Costume Mode: ${gGame.manualMinesCount} left to place`;
    renderModeTitle(`Costume Mode: ${gGame.manualMinesCount} left to place`);
    // Hide Board and starts when last mine is placed
    if (gGame.manualMinesCount === 0) {
      gGame.isManual = false;
      renderBoard(gBoard);
      startGame(true);
    }

    return;
  }

  if (!gGame.isOn) startGame();

  // ignore clicks on shown cells
  if (clickedCell.isShown) return;

  // Handle Hint On
  if (gGame.isHintOn) {
    flickerCell(elCell, clickedCell);
    gGame.isHintOn = false;
    return;
  }

  // Update Model
  clickedCell.isShown = true;

  // Update DOM
  showCell(elCell, clickedCell);

  // Hangle mine clicks
  if (clickedCell.isMine) {
    gGame.livesCount--;
    renderLives();

    // considered as marked mine
    clickedCell.isMarked = true;

    if (gGame.livesCount === 1) renderGameState(DYING_ICON);
    if (!gGame.livesCount) {
      gameLost();
    }

    return;
  }

  // handle cell with no mines around
  if (clickedCell.minesAroundCount === 0) expandShown(gBoard, i, j);

  // Check if game Won
  if (checkGameOver()) gameWon();
}

// Handle right clicks on a cell to add/remove flags
function cellMarked(ev, elCell) {
  // prevent context menu open
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
  if (checkGameOver()) gameWon();
}

// Expand  shown cells for every cell that had no mine neighbors
function expandShown(board, rowIdx, colIdx) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;

    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[i].length) continue;
      if (i === rowIdx && j === colIdx) continue;

      var currCell = board[i][j];

      if (currCell.isShown) continue;

      // Model
      currCell.isShown = true;

      // DOM
      showCellByLoc({ i, j });

      if (currCell.minesAroundCount === 0) expandShown(board, i, j);
    }
  }
}

function hintClicked(elHint) {
  if (gGame.isHintOn) return;

  renderModeTitle('Pick a cell for a hint');
  // Model
  gGame.isHintOn = true;
  gGame.hintsCount--;

  // DOM
  elHint.style.color = '#F7D716';
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

// Handle game lost state
function gameLost() {
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
      showCellByLoc({ i, j });
    }
  }

  // DOM
  renderGameState(DEAD_ICON);
}

// Handle game won state
function gameWon() {
  clearInterval(gInterval);

  // Model
  gGame.isOver = true;
  gGame.isOn = false;

  // DOM
  renderGameState(WON_ICON);
}

// Initialize and render timer
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

// Handle manual mode
function setManualMode() {
  gGame.isManual = true;
  gGame.manualMinesCount = gLevel.MINES;
  // const elModeTitle = document.querySelector('.mode-title');
  // elModeTitle.innerText = `Costume Mode: ${gGame.manualMinesCount} left to place`;
  renderModeTitle(`Costume Mode: ${gGame.manualMinesCount} left to place`);
}
