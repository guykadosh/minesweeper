'use strict';

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

// render cell by given location
function showCellByLoc(location) {
  // get model
  var cell = gBoard[location.i][location.j];

  // get DOM
  var cellId = '#' + getIdName(location);
  var elCell = document.querySelector(cellId);

  showCell(elCell, cell);
}

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

// Render Lives
function renderLives() {
  const elLives = document.querySelector('.lives');
  var strHTML = '';
  for (var i = 0; i < gGame.livesCount; i++) {
    strHTML += LIVE_ICON;
  }

  elLives.innerHTML = strHTML;
}

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

function showSafeCell(elBtn) {
  if (!gGame.safeCount) return;

  gGame.safeCount--;

  var cellCoord = getSafeCellLoc();

  showCellByLoc(cellCoord);
  elBtn.innerText = `${gGame.safeCount} Safe Clicks`;

  setTimeout(() => {
    hideCellByLoc(cellCoord);
  }, 2000);
}

function flickerCell(elCell, cell, milliSecs) {
  elCell.classList.remove('cell--hidden');
  elCell.classList.add('cell--shown');

  if (cell.isMine) {
    elCell.innerHTML = `<span style="color:#FF5D5D">${MINE_ICON}</span>`;
  } else {
    elCell.innerText =
      cell.minesAroundCount === 0 ? ' ' : cell.minesAroundCount;
  }

  setTimeout(() => {
    hideCell(elCell);

    renderHints();
  }, 200);
}
