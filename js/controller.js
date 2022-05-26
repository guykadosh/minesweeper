'use strict';

///////////////////////////
/// Handle Events      ///
/////////////////////////

// This is called when page loads
function initGame() {
  // Re/Build board
  gBoard = buildBoard();
  renderBoard(gBoard);

  // Reset moves
  gGame.moves = [];

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
  renderBestTime();
}

// Start game on first move
function startGame(isModed = false, location = null) {
  gGame.isOn = true;
  if (!isModed) setMines(gBoard, gLevel.MINES, location);
  renderModeTitle(GAME_ON_TITLE);
  setMinesNegsCount(gBoard);

  gStartTime = new Date();
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
  if (!gGame.isOn) startGame(false, { i, j });

  // ignore clicks on shown cells
  if (clickedCell.isShown || clickedCell.isMarked) return;

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

function hintClicked(elHint) {
  if (!gGame.isOn) {
    guardMsg();
    return;
  }

  if (gGame.isHintOn) return;
  // User instructions
  renderModeTitle('Pick a cell for a hint');

  // Model
  gGame.isHintOn = true;
  gGame.hintsCount--;

  // DOM
  elHint.style.color = '#F7D716';
}

// Handle manual mode
function setManualMode() {
  if (gGame.isOn) {
    guardMsg();
    return;
  }

  gGame.isManual = true;
  gGame.manualMinesCount = gLevel.MINES;

  renderModeTitle(`Costume Mode: ${gGame.manualMinesCount} left to place`);
}

// Handle user picked 7-Boom mode
function set7BoomMode() {
  if (gGame.isOn) {
    guardMsg();
    return;
  }

  gGame.is7BoomMode = true;
  gBoard = buildBoard();
  set7BoomMines(gBoard);
  renderModeTitle(SEVEN_BOOM_TITLE);
}

// Hides back any last move
function undoMove() {
  if (!gGame.isOn || !gGame.moves.length) return;

  var lastMove = gGame.moves.pop();
  if (Array.isArray(lastMove)) {
    lastMove.forEach(move => {
      move.cell.isShown = false;
      hideCellByLoc(move.location);
    });
  } else {
    lastMove.cell.isShown = false;
    hideCellByLoc(lastMove.location);
  }
}
