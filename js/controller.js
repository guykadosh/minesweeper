'use strict';

// This is called when page loads
function initGame() {
  // Re/Build board
  gBoard = buildBoard();
  renderBoard(gBoard);

  // Stop and clear timer
  clearInterval(gInterval);
  const elTimer = document.querySelector('.timer');
  elTimer.innerText = '00:00:00';

  // Reset Game modes
  gGame.isOn = false;
  gGame.isOver = false;
  gGame.is7BoomMode = false;
  gGame.isManual = false;

  // Initialize game state and helpers
  renderGameState(ALIVE_ICON);

  gGame.livesCount = 3;
  renderLives();

  gGame.hintsCount = 3;
  renderHints();

  renderModeTitle('Normal Mode');
}

// Start game on first move
function startGame(isModed = false) {
  gGame.isOn = true;
  if (!isModed) setMines(gBoard, gLevel.MINES);
  renderModeTitle(GAME_ON_TITLE);
  setMinesNegsCount(gBoard);
  startTimer();
}

// Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
  if (gGame.isOver) return;

  var clickedCell = gBoard[i][j];

  // Handle manual building board clicks
  if (gGame.isManual && gGame.manualMinesCount) {
    // Model
    gGame.manualMinesCount--;
    clickedCell.isMine = true;

    // DOM
    showCell(elCell, clickedCell);
    renderModeTitle(`Costume Mode: ${gGame.manualMinesCount} left to place`);

    // Hide Board
    if (gGame.manualMinesCount === 0) {
      renderBoard(gBoard);
      renderModeTitle('Ready to start');
    }

    return;
  }

  // Once done building manually board start the game
  if (gGame.isManual && !gGame.manualMinesCount) {
    gGame.isManual = false;
    startGame(true);
  }

  // Handle 7 Boom mode
  if (gGame.is7BoomMode) {
    startGame(true);
    gGame.is7BoomMode = false;
  }

  //  Start normal mode
  if (!gGame.isOn) startGame();

  // ignore clicks on shown cells
  if (clickedCell.isShown) return;

  // Handle Hint On
  if (gGame.isHintOn) {
    flickerCell(elCell, clickedCell);
    gGame.isHintOn = false;
    return;
  }

  // Show Cell
  // Update Model
  clickedCell.isShown = true;

  // Update DOM
  showCell(elCell, clickedCell);

  // Handle mine clicks
  if (clickedCell.isMine) {
    gGame.livesCount--;
    renderLives();

    // Push to last moves
    gGame.moves.push({ cell: clickedCell, location: { i, j } });
    // considered as a marked mine
    clickedCell.isMarked = true;

    if (gGame.livesCount === 1) renderGameState(DYING_ICON);

    if (!gGame.livesCount) {
      gameLost();
    }

    return;
  }

  // handle cell with no mines around
  if (clickedCell.minesAroundCount === 0) {
    gGame.moves.push([{ cell: clickedCell, location: { i, j } }]);
    expandShown(gBoard, i, j);
  } else {
    gGame.moves.push({ cell: clickedCell, location: { i, j } });
  }

  console.log(gGame.moves);
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
      gGame.moves[gGame.moves.length - 1].push({
        cell: currCell,
        location: { i, j },
      });
    }
  }
}

function hintClicked(elHint) {
  if (gGame.isHintOn) return;

  // User instructions
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
  renderModeTitle('You Got Bombed!');
}

// Handle game won state
function gameWon() {
  clearInterval(gInterval);

  // Model
  gGame.isOver = true;
  gGame.isOn = false;

  // DOM
  renderGameState(WON_ICON);
  renderModeTitle('Well Done!');
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
  if (gGame.isOn) {
    renderModeTitle(`Restart Game first`);
    setTimeout(() => renderModeTitle(GAME_ON_TITLE), 800);
    return;
  }

  gGame.isManual = true;
  gGame.manualMinesCount = gLevel.MINES;

  renderModeTitle(`Costume Mode: ${gGame.manualMinesCount} left to place`);
}

function set7BoomMode() {
  if (gGame.isOn) {
    renderModeTitle(`Restart Game first`);
    setTimeout(() => renderModeTitle(GAME_ON_TITLE), 800);
    return;
  }

  gGame.is7BoomMode = true;
  gBoard = buildBoard();
  set7BoomMines(gBoard);
  renderModeTitle(SEVEN_BOOM_TITLE);
}

function undoMove() {
  if (!gGame.isOn) return;

  var lastMoves = gGame.moves.pop();
  if (Array.isArray(lastMoves)) {
    lastMoves.forEach(move => {
      move.cell.isShown = false;
      hideCellByLoc(move.location);
    });
  } else {
    lastMoves.cell.isShown = false;
    hideCellByLoc(lastMoves.location);
  }
}
