'use strict';

const MINE_ICON = '<i class="fa-solid fa-bomb"></i>';
const FLAG_ICON = '<i class="fa-brands fa-font-awesome"></i>';
const ALIVE_ICON = '<i class="fa-regular fa-face-smile"></i>';
const DEAD_ICON = '<i class="fa-regular fa-face-dizzy"></i>';
const WON_ICON = '<i class="fa-regular fa-face-laugh-beam"></i>';
// const WON_ICON = '<i class="fa-regular fa-face-sunglasses"></i>';

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

// Render Cell
function showCell(elCell, cell) {
  elCell.classList.remove('cell--hidden');
  elCell.classList.add('cell--shown');

  if (cell.isMine) {
    elCell.innerHTML = `<span style="color:#FF5D5D">${MINE_ICON}</span>`;
    return;
  }

  elCell.innerText = cell.minesAroundCount === 0 ? ' ' : cell.minesAroundCount;
}
