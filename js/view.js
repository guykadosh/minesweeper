'use strict'

////////////////////////////////////
///  DOM manipulation  functions ///
////////////////////////////////////

// render letiables

// icons
const MINE_ICON = '<i class="fa-solid fa-bomb"></i>'
const FLAG_ICON = '<i class="fa-brands fa-font-awesome"></i>'
const ALIVE_ICON = '<i class="fa-regular fa-face-smile"></i>'
const DEAD_ICON = '<i class="fa-regular fa-face-dizzy"></i>'
const WON_ICON = '<i class="fa-regular fa-face-laugh-beam"></i>'
const LIVE_ICON = '<i class="fa-solid fa-heart"></i>'
const DYING_ICON = '<i class="fa-regular fa-face-surprise"></i>'
const HINT_HTML = `<span class="hint" onclick="hintClicked(this)"
><i class="fa-regular fa-lightbulb"></i
></span>`

// titles
const GAME_ON_TITLE = `${FLAG_ICON} Flag all mines to win`
const SEVEN_BOOM_TITLE = '7 Boom Mode'
const INSANE_MODE_TITLE = 'Insane Mode! Change zoom 120%-150%'
const WON_TITLE = '<i class="fa-solid fa-champagne-glasses"></i> Well Done!'
const LOST_TITLE = '<i class="fa-solid fa-land-mine-on"></i> You Got Bombed!'

// Number colors
const colors = [
  '#f9fcfa',
  '#2b8a3e',
  '#0b7285',
  '#495057',
  '#c2255c',
  '#862e9c',
  '#228be6',
  '#212529',
]

// Render the board as a <table>
// to the page
function renderBoard(board) {
  let strHTML = ''
  for (let i = 0; i < board.length; i++) {
    strHTML += '<tr>\n'
    for (let j = 0; j < board[0].length; j++) {
      // add class if INSANE mode
      let classInsane = gLevel.SIZE === INSANE_SIZE ? 'cell--insane' : ''

      strHTML += `\t<td 
      class="cell cell-${i}-${j} cell--hidden ${classInsane}" 
      onclick="cellClicked(this, ${i}, ${j})"
      oncontextmenu="cellMarked(event, this)">
      </td>\n`
    }
    strHTML += '</tr>\n'
  }

  const elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
}

// Render Lives
function renderLives() {
  const elLives = document.querySelector('.lives')
  let strHTML = ''
  for (let i = 0; i < gGame.livesCount; i++) {
    strHTML += LIVE_ICON
  }

  elLives.innerHTML = strHTML
}

// Rerender hints
function renderHints() {
  const elHints = document.querySelector('.hints')
  let strHTML = ''
  for (let i = 0; i < gGame.hintsCount; i++) {
    strHTML += HINT_HTML
  }

  elHints.innerHTML = strHTML
}

function renderGameState(value) {
  const elGameState = document.querySelector('.game-state .icon')
  elGameState.innerHTML = value
}

// Shows random safe cell for 2 seconds
function showSafeCell(elBtn) {
  if (!gGame.isOn) {
    renderGuardMsg()
    return
  }

  if (!gGame.safeCount) return

  gGame.safeCount--

  let cellCoord = getSafeCellLoc()

  showCellByLoc(cellCoord)
  elBtn.innerText = `${gGame.safeCount} Safe Clicks`

  setTimeout(() => {
    hideCellByLoc(cellCoord)
  }, 1000)
}

function renderSafeCounts() {
  const elSafeCount = document.querySelector('.btn--safe')
  elSafeCount.innerText = '3 Safe Clicks'
}

// recieve location and shows to the user all cells around it(include the cell)
function showHintArea(location) {
  toggleAreaVisibility(location)

  setTimeout(() => {
    toggleAreaVisibility(location, true)

    renderModeTitle(GAME_ON_TITLE)
    renderHints()
  }, 500)
}

function toggleAreaVisibility(location, toHide = false) {
  for (let i = location.i - 1; i <= location.i + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue
    for (let j = location.j - 1; j <= location.j + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue
      if (gBoard[i][j].isShown || gBoard[i][j].isMarked) continue
      if (!toHide) showCellByLoc({ i, j })
      else hideCellByLoc({ i, j })
    }
  }
}

function renderTimer() {
  const elTimer = document.querySelector('.timer')
  elTimer.innerText = '00:00:00'
}

// Render the best time according to current level
function renderBestTime() {
  const elBestTime = document.querySelector('.best-time')

  switch (gLevel.SIZE) {
    case 4:
      elBestTime.innerText = `Beginner: ${convertMsToTime(gBestTimeBeginner)}`
      break
    case 8:
      elBestTime.innerText = `Medium: ${convertMsToTime(gBestTimeMedium)}`
      break
    case 12:
      elBestTime.innerText = `Expert: ${convertMsToTime(gBestTimeExpert)}`
      break
    case 30:
      elBestTime.innerText = `Insane: ${convertMsToTime(gBestTimeInsane)}`
      break
  }
}

// Render Mode title and user instructions
function renderModeTitle(Txt) {
  const elModeTitle = document.querySelector('.mode-title')
  elModeTitle.innerHTML = Txt
}

// Guard msgs when some features not available is some situatuions
function renderGuardMsg() {
  if (!gGame.isOn) {
    renderModeTitle(`Start Game First`)
    setTimeout(() => renderModeTitle('Click on a cell to start game'), 800)
  } else {
    renderModeTitle(`Restart Game first`)
    setTimeout(() => renderModeTitle(GAME_ON_TITLE), 800)
  }
}

/// RENDER CELLS FUNCTIONS

// Show cell by given location
function showCellByLoc(location) {
  // get model
  let cell = gBoard[location.i][location.j]

  // get DOM
  let cellId = '.' + getClassName(location)
  let elCell = document.querySelector(cellId)

  showCell(elCell, cell)
}

// Hide cell by given location
function hideCellByLoc(location) {
  // get DOM
  let cellId = '.' + getClassName(location)
  let elCell = document.querySelector(cellId)

  hideCell(elCell)
}

// Show Cell
function showCell(elCell, cell) {
  elCell.classList.remove('cell--hidden')
  elCell.classList.add('cell--shown')

  if (cell.isMine) {
    elCell.innerHTML = `<span style="color:#FF5D5D">${MINE_ICON}</span>`
    return
  }

  elCell.innerHTML = `<span style="color:${colors[cell.minesAroundCount]}">${
    cell.minesAroundCount ? cell.minesAroundCount : ''
  }</span>`
}

// Hide Cell
function hideCell(elCell) {
  elCell.classList.remove('cell--shown')
  elCell.classList.add('cell--hidden')

  elCell.innerText = ''
}

function renderMarkByLoc(location) {
  let cellId = '.' + getClassName(location)
  let elCell = document.querySelector(cellId)

  elCell.innerHTML = `<span style="color:#fff">${FLAG_ICON}</span>`
}

function renderMinesLeft() {
  const elMinesLeft = document.querySelector('.mines-left')
  elMinesLeft.innerText = (gLevel.MINES - gGame.markedCount)
    .toString()
    .padStart(2, '0')
}

// Handel Rules button
function openRules() {
  const elModal = document.querySelector('.modal')
  const elOverlay = document.querySelector('.overlay')

  elModal.classList.add('modal-fade-in')
  elOverlay.classList.remove('hidden')
}

function closeRules() {
  const elModal = document.querySelector('.modal')
  const elOverlay = document.querySelector('.overlay')

  elModal.classList.remove('modal-fade-in')
  elOverlay.classList.add('hidden')
}

// Handle zoom buttons and scale the game board
function scaleGame(elBtn, scaleSize = 0) {
  if (gGame.scale < 50 && scaleSize < 0) return
  if (gGame.scale > 130 && scaleSize > 0) return

  const elGame = document.querySelector('.grid')
  gGame.scale += scaleSize
  const scaleStr = `scale(${gGame.scale}%)`
  elGame.style.transform = scaleStr

  const elBtnTxt = elBtn.querySelector('div')
  elBtnTxt.innerText = `${gGame.scale}%`
  setTimeout(
    () => (elBtnTxt.innerText = scaleSize < 0 ? 'Zoom out' : 'Zoom in'),
    700
  )
}
