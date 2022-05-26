'use strict';

////////////////////////////////////
///  DOM manipulation  functions ///
////////////////////////////////////

// render variables

const MINE_ICON = '<i class="fa-solid fa-bomb"></i>';
const FLAG_ICON = '<i class="fa-brands fa-font-awesome"></i>';
const ALIVE_ICON = '<i class="fa-regular fa-face-smile"></i>';
const DEAD_ICON = '<i class="fa-regular fa-face-dizzy"></i>';
const WON_ICON = '<i class="fa-regular fa-face-laugh-beam"></i>';
const LIVE_ICON = '<i class="fa-solid fa-heart"></i>';
const DYING_ICON = '<i class="fa-regular fa-face-surprise"></i>';
const HINT_HTML = `<span class="hint" onclick="hintClicked(this)"
><i class="fa-regular fa-lightbulb"></i
></span>`;
const GAME_ON_TITLE = `${FLAG_ICON} Flag all mines to win`;
const SEVEN_BOOM_TITLE = '7 Boom Mode';

// Render the board as a <table>
// to the page
function renderBoard(board) {
  var strHTML = '';
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>\n';
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      var classList = currCell.isShown ? 'cell--shown' : 'cell--hidden';

      strHTML += `\t<td 
      id="cell-${i}-${j}" 
      class="cell ${classList}" 
      onclick="cellClicked(this, ${i}, ${j})"
      oncontextmenu="cellMarked(event, this)">
      </td>\n`;
    }
    strHTML += '</tr>\n';
  }

  // console.log(strHTML);
  const elBoard = document.querySelector('.board');
  elBoard.innerHTML = strHTML;
}

// Render Lives
function renderLives() {
  const elLives = document.querySelector('.lives');
  var strHTML = '';
  for (var i = 0; i < gGame.livesCount; i++) {
    strHTML += LIVE_ICON;
  }

  elLives.innerHTML = strHTML;
}

// Rerender hints
function renderHints() {
  const elHints = document.querySelector('.hints');
  var strHTML = '';
  for (var i = 0; i < gGame.hintsCount; i++) {
    strHTML += HINT_HTML;
  }

  elHints.innerHTML = strHTML;
}

function renderGameState(value) {
  const elGameState = document.querySelector('.game-state .icon');
  elGameState.innerHTML = value;
}

// Shows random safe cell for 2 seconds
function showSafeCell(elBtn) {
  if (!gGame.isOn) {
    renderGuardMsg();
    return;
  }

  if (!gGame.safeCount) return;

  gGame.safeCount--;

  var cellCoord = getSafeCellLoc();

  showCellByLoc(cellCoord);
  elBtn.innerText = `${gGame.safeCount} Safe Clicks`;

  setTimeout(() => {
    hideCellByLoc(cellCoord);
  }, 2000);
}

// recieve location and shows to the user all cells around it(include the cell)
function showHintArea(location) {
  console.log('i got called');
  for (var i = location.i - 1; i <= location.i + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = location.j - 1; j <= location.j + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue;
      showCellByLoc({ i, j });
    }
  }

  setTimeout(() => {
    for (var i = location.i - 1; i <= location.i + 1; i++) {
      if (i < 0 || i >= gBoard.length) continue;
      for (var j = location.j - 1; j <= location.j + 1; j++) {
        if (j < 0 || j >= gBoard[i].length) continue;
        hideCellByLoc({ i, j });
      }
    }
    renderModeTitle(GAME_ON_TITLE);
    renderHints();
  }, 300);
}

// Render the best time according to current level
function renderBestTime() {
  const elBestTime = document.querySelector('.best-time');

  switch (gLevel.SIZE) {
    case 4:
      elBestTime.innerText = `Beginner: ${convertMsToTime(gBestTimeBeginner)}`;
      break;
    case 8:
      elBestTime.innerText = `Medium: ${convertMsToTime(gBestTimeMedium)}`;
      break;
    case 12:
      elBestTime.innerText = `Expert: ${convertMsToTime(gBestTimeExpert)}`;
      break;
  }
}

// Render Mode title and user instructions
function renderModeTitle(Txt) {
  const elModeTitle = document.querySelector('.mode-title');
  elModeTitle.innerHTML = Txt;
}

// Guard msgs when some features not available is some situatuions
function renderGuardMsg() {
  if (!gGame.isOn) {
    renderModeTitle(`Start Game First`);
    setTimeout(() => renderModeTitle('Click on a cell to start game'), 800);
  } else {
    renderModeTitle(`Restart Game first`);
    setTimeout(() => renderModeTitle(GAME_ON_TITLE), 800);
  }
}

/// RENDER CELLS FUNCTIONS

// Show cell by given location
function showCellByLoc(location) {
  // get model
  var cell = gBoard[location.i][location.j];

  // get DOM
  var cellId = '#' + getIdName(location);
  var elCell = document.querySelector(cellId);

  showCell(elCell, cell);
}

// Hide cell by given location
function hideCellByLoc(location) {
  // get DOM
  var cellId = '#' + getIdName(location);
  var elCell = document.querySelector(cellId);

  hideCell(elCell);
}

// Show Cell
function showCell(elCell, cell) {
  elCell.classList.remove('cell--hidden');
  elCell.classList.add('cell--shown');

  if (cell.isMine) {
    elCell.innerHTML = `<span style="color:#FF5D5D">${MINE_ICON}</span>`;
    return;
  }

  elCell.innerText = cell.minesAroundCount === 0 ? ' ' : cell.minesAroundCount;
}

// Hide Cell
function hideCell(elCell) {
  elCell.classList.remove('cell--shown');
  elCell.classList.add('cell--hidden');

  elCell.innerText = '';
}

function renderMarkByLoc(location) {
  var cellId = '#' + getIdName(location);
  var elCell = document.querySelector(cellId);

  elCell.innerHTML = `<span style="color:#fff">${FLAG_ICON}</span>`;
}
