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

  // Reset Counts
  gGame.shownCount = 0;
  gGame.markedCount = 0;

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
    showHintArea({ i, j });
    // flickerCell(elCell, clickedCell);
    gGame.isHintOn = false;
    return;
  }

  // Show Cell
  // Update Model
  clickedCell.isShown = true;
  gGame.shownCount++;

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
    gGame.markedCount++;

    // Worried emoji on last chance
    if (gGame.livesCount === 1) renderGameState(DYING_ICON);

    // When relevant  check if game won(clicked last mine but still has lives)
    if (gGame.markedCount >= gLevel.MINES && checkGameOver()) gameWon();

    // Lose game when out of lifes
    if (!gGame.livesCount) gameLost();

    return;
  }

  // handle cell with no mines around
  if (clickedCell.minesAroundCount === 0) {
    gGame.moves.push([{ cell: clickedCell, location: { i, j } }]);
    expandShown(gBoard, i, j);
  } else {
    gGame.moves.push({ cell: clickedCell, location: { i, j } });
  }

  // When relevant  check if game won
  if (gGame.shownCount >= gLevel.SIZE ** 2 - gLevel.MINES && checkGameOver())
    gameWon();
}

// Handle right clicks on a cell to add/remove flags
function cellMarked(ev, elCell) {
  // prevent context menu open
  ev.preventDefault();

  if (!gGame.isOn) return;

  var coord = getCellCoord(elCell.id);
  var curCell = gBoard[coord.i][coord.j];

  if (curCell.isShown) return;

  // Unmark
  if (curCell.isMarked) {
    curCell.isMarked = false;
    gGame.markedCount--;

    elCell.innerHTML = '';
    return;
  }

  // Update model
  curCell.isMarked = true;
  gGame.markedCount++;

  // Update DOM
  elCell.innerHTML = `<span style="color:#fff">${FLAG_ICON}</span>`;

  // When relevant  check if game won
  if (gGame.markedCount > gLevel.MINES && checkGameOver()) gameWon();
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
  if (checkNonMinesShown()) return;

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
  if (checkNonMinesShown()) return;

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
      gGame.shownCount--;
      hideCellByLoc(move.location);
    });
  } else {
    lastMove.cell.isShown = false;
    gGame.shownCount--;
    if (lastMove.cell.isMine) gGame.livesCount++;
    renderLives();
    hideCellByLoc(lastMove.location);
  }
}
