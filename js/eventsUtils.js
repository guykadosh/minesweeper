///////////////////////////
/// Handle Events Utils///
/////////////////////////

// Timers

// Initialize and render timer
function startTimer() {
  // Clear if there is previous interval
  clearInterval(gInterval);

  gInterval = setInterval(function () {
    var timeDiffMs = Date.now() - gStartTime;
    // Update DOM
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = convertMsToTime(timeDiffMs);
  }, 59);
}

// Check end time
function getEndtime() {
  gEndTime = new Date();
  var timeDiff = gEndTime - gStartTime; //in ms
  // strip the ms
  return timeDiff;
}

// Once called when game done checks bext time and render it
function checkBestTime() {
  var time = getEndtime();

  switch (gLevel.SIZE) {
    case 4:
      setBestTime(gBestTimeBeginner, 'bestTimeBeginner', time);
      gBestTimeBeginner = +localStorage.getItem('bestTimeBeginner');
      break;
    case 8:
      setBestTime(gBestTimeMedium, 'bestTimeMedium', time);
      gBestTimeMedium = localStorage.getItem('bestTimeMedium');
      break;
    case 12:
      setBestTime(gBestTimeExpert, 'bestTimeExpert', time);
      gBestTimeExpert = localStorage.getItem('bestTimeExpert');
      break;
    case 30:
      setBestTime(gBestTimeInsane, 'bestTimeInsane', time);
      gBestTimeInsane = localStorage.getItem('bestTimeInsane');
      break;
  }
  renderBestTime();
}

function setBestTime(bestTimeLevel, bestTimeStorageName, time) {
  if (!bestTimeLevel) localStorage.setItem(bestTimeStorageName, time);
  if (bestTimeLevel > time) localStorage.setItem(bestTimeStorageName, time);
}

// End Game

// Handle game lost state
function gameLost() {
  // Model
  gGame.isOver = true;
  gGame.isOn = false;

  clearInterval(gInterval);

  // DOM
  renderGameState(DEAD_ICON);
  renderModeTitle(LOST_TITLE);

  // reveals all mines on board
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isShown || !gBoard[i][j].isMine) continue;

      // Model
      gBoard[i][j].isShown = true;

      // DOM
      showCellByLoc({ i, j });
    }
  }
}

// Handle game won state
function gameWon() {
  clearInterval(gInterval);

  // Model
  gGame.isOver = true;
  gGame.isOn = false;

  // DOM
  renderGameState(WON_ICON);
  renderModeTitle(WON_TITLE);

  // Put flags on all bombs not marked and reveals rest of board
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isShown) continue;

      if (gBoard[i][j].isMine) {
        // Model
        gBoard[i][j].isMarked = true;
        gGame.markedCount++;
        // DOM
        renderMarkByLoc({ i, j });
      } else {
        // Model
        gBoard[i][j].isShown = true;
        // DOM
        showCellByLoc({ i, j });
      }
    }
  }

  // Check if best score
  checkBestTime();
}

// Checks if user won the game
function checkGameOver() {
  return checkNonMinesShown() || checkMinesFlagged();
}

// first win condition - all non mines are revealed
function checkNonMinesShown() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var curCell = gBoard[i][j];
      if (!curCell.isShown && !curCell.isMine) {
        return false;
      }
    }
  }
  return true;
}

// second win condition - if not all revealed but all mines are flagged
function checkMinesFlagged() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var curCell = gBoard[i][j];
      if (curCell.isMine && !curCell.isMarked) {
        return false;
      }
    }
  }
  return true;
}

// Called when user clicks on mine
function stepOnMine(cell, i, j) {
  gGame.livesCount--;
  renderLives();

  // Push to last moves
  gGame.moves.push({ cell, location: { i, j } });

  // considered as a marked mine
  cell.isMarked = true;
  gGame.markedCount++;

  // Worried emoji on last chance
  if (gGame.livesCount === 1) renderGameState(DYING_ICON);

  // When relevant  check if game won(clicked last mine but still has lives)
  if (gGame.markedCount === gLevel.MINES && checkGameOver()) gameWon();

  // Lose game when out of lifes
  if (!gGame.livesCount) gameLost();
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
      gGame.shownCount++;
      // DOM
      showCellByLoc({ i, j });

      // if finds another cell with no neighbors render its surrounding aswell
      if (currCell.minesAroundCount === 0) expandShown(board, i, j);
      gGame.moves[gGame.moves.length - 1].push({
        cell: currCell,
        location: { i, j },
      });
    }
  }
}

// Called when user on manual board and pick spot for mine
function setMineManual(elCell, cell) {
  // Model
  gGame.manualMinesCount--;
  cell.isMine = true;

  // DOM
  showCell(elCell, cell);
  renderModeTitle(`Costume Mode: ${gGame.manualMinesCount} left to place`);

  // Hide Board
  if (gGame.manualMinesCount === 0) {
    renderBoard(gBoard);
    renderModeTitle('Ready to start');
  }
}
