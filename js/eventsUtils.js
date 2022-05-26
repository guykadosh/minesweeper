///////////////////////////
/// Handle Events Utils///
/////////////////////////

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
      if (!gBestTimeBeginner) localStorage.setItem('bestTimeBeginner', time);
      if (gBestTimeBeginner > time)
        localStorage.setItem('bestTimeBeginner', time);
      gBestTimeBeginner = +localStorage.getItem('bestTimeBeginner');
      renderBestTime();
      break;
    case 8:
      if (!gBestTimeMedium) localStorage.setItem('bestTimeMedium', time);
      if (gBestTimeMedium > time) localStorage.setItem('bestTimeMedium', time);
      gBestTimeMedium = localStorage.getItem('bestTimeMedium');
      renderBestTime();
      break;
    case 12:
      if (!gBestTimeExpert) localStorage.setItem('bestTimeExpert', time);
      if (gBestTimeExpert > time) localStorage.setItem('bestTimeExpert', time);
      gBestTimeExpert = localStorage.getItem('bestTimeExpert');
      renderBestTime();
      break;
  }
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

  // Put flags on all bombs not marked
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isShown) continue;

      // Model
      gBoard[i][j].isMarked = true;

      // DOM
      renderMarkByLoc({ i, j });
    }
  }

  // Check if best score
  checkBestTime();
}

// Checks if user won the game
function checkGameOver() {
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
