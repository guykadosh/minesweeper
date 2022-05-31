'use strict'

///////////////////////////
/// Handle Events      ///
/////////////////////////

// This is called when page loads
function initGame() {
  initModel()
  initDOM()
}

function initModel() {
  // Re/Build board
  gBoard = buildBoard()

  // Stop timer
  clearInterval(gInterval)

  // Reset moves
  gGame.moves = []

  // Reset Game modes
  gGame.isOn = false
  gGame.isOver = false
  gGame.is7BoomMode = false
  gGame.isManual = false

  // Reset Counts
  gGame.shownCount = gGame.markedCount = 0

  // reset helpers
  gGame.livesCount = gGame.hintsCount = gGame.safeCount = 3
}

function initDOM() {
  renderBoard(gBoard)

  //clear timer
  renderTimer()

  // Initialize game state and helpers
  renderGameState(ALIVE_ICON)

  renderLives()
  renderHints()
  renderSafeCounts()

  // Render mode title
  renderModeTitle('Normal Mode')

  renderMinesLeft()

  if (gLevel.SIZE === INSANE_SIZE) {
    renderModeTitle(INSANE_MODE_TITLE)
  }

  renderBestTime()
}

// Start game on first move
function startGame(isModed = false, location = null) {
  gGame.isOn = true

  // When normal mode sets mines randomally on board
  // Will not set mine on given location (first click)
  if (!isModed) setMines(gBoard, gLevel.MINES, location)

  // for every non mine cell counting neighbouring mines
  setMinesNegsCount(gBoard)

  // Render game start title
  renderModeTitle(GAME_ON_TITLE)

  // Start timers
  gStartTime = new Date()
  startTimer()
}

// Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
  if (gGame.isOver) return

  let clickedCell = gBoard[i][j]

  // BEFORE GAME STARTS

  // Handle manual building board clicks
  if (gGame.isManual && gGame.manualMinesCount) {
    setMineManual(elCell, clickedCell)
    return
  }

  // Once done building manually board start the game
  if (gGame.isManual && !gGame.manualMinesCount) {
    gGame.isManual = false
    startGame(true)
  }

  // Start 7 Boom mode
  if (gGame.is7BoomMode) {
    gGame.is7BoomMode = false
    startGame(true)
  }

  //  Start normal mode
  if (!gGame.isOn) startGame(false, { i, j })

  // AFTER GAME STARTS

  // ignore clicks on shown & marked cells
  if (clickedCell.isShown || clickedCell.isMarked) return

  // Handle Hint On
  if (gGame.isHintOn) {
    showHintArea({ i, j })

    gGame.isHintOn = false
    return
  }

  // Show Cell
  // Update Model
  clickedCell.isShown = true
  gGame.shownCount++

  // Update DOM
  showCell(elCell, clickedCell)

  // Handle mine clicks
  if (clickedCell.isMine) {
    stepOnMine(clickedCell, i, j)
    return
  }

  // handle cell with no mines around
  if (clickedCell.minesAroundCount === 0) {
    gGame.moves.push([{ cell: clickedCell, location: { i, j } }])
    expandShown(gBoard, i, j)
  } else {
    gGame.moves.push({ cell: clickedCell, location: { i, j } })
  }

  // When relevant  check if game won
  // Insane mode
  if (gLevel.SIZE === INSANE_SIZE) {
    if (
      gGame.shownCount >= gLevel.SIZE * gLevel.INSANE - gLevel.MINES &&
      checkGameOver()
    )
      gameWon()
  }

  // Rest of modes
  if (gGame.shownCount >= gLevel.SIZE ** 2 - gLevel.MINES && checkGameOver())
    gameWon()
}

// Handle right clicks on a cell to add/remove flags
function cellMarked(ev, elCell) {
  // prevent context menu open
  ev.preventDefault()

  if (!gGame.isOn) return

  let coord = getCellCoord(elCell.id)
  let curCell = gBoard[coord.i][coord.j]

  if (curCell.isShown) return

  // Unmark
  if (curCell.isMarked) {
    curCell.isMarked = false
    gGame.markedCount--
    renderMinesLeft()

    elCell.innerHTML = ''
    return
  }

  if (gGame.markedCount === gLevel.MINES) return

  // Update model
  curCell.isMarked = true
  gGame.markedCount++
  renderMinesLeft()

  // Update DOM
  elCell.innerHTML = `<span style="color:#fff">${FLAG_ICON}</span>`

  // When relevant  check if game won
  if (gGame.markedCount === gLevel.MINES && checkGameOver()) gameWon()
}

function hintClicked(elHint) {
  if (!gGame.isOn) {
    renderGuardMsg()
    return
  }

  if (gGame.isHintOn) return

  // User instructions
  renderModeTitle('Pick a cell for a hint')

  // Model
  gGame.isHintOn = true
  gGame.hintsCount--

  // DOM
  elHint.style.color = '#F7D716'
}

// Handle manual mode
function setManualMode() {
  if (checkNonMinesShown()) return

  if (gGame.isOn) {
    renderGuardMsg()
    return
  }

  gGame.isManual = true
  gGame.manualMinesCount = gLevel.MINES

  renderModeTitle(`Costume Mode: ${gGame.manualMinesCount} left to place`)
}

// Handle user picked 7-Boom mode
function set7BoomMode() {
  if (checkNonMinesShown()) return

  if (gGame.isOn) {
    renderGuardMsg()
    return
  }

  gGame.is7BoomMode = true
  gBoard = buildBoard()
  set7BoomMines(gBoard)
  renderModeTitle(SEVEN_BOOM_TITLE)
}

// Hides back any last move
function undoMove() {
  if (!gGame.isOn || !gGame.moves.length) return

  let lastMove = gGame.moves.pop()
  if (Array.isArray(lastMove)) {
    lastMove.forEach(move => {
      move.cell.isShown = false
      gGame.shownCount--
      hideCellByLoc(move.location)
    })
  } else {
    lastMove.cell.isShown = false
    gGame.shownCount--
    if (lastMove.cell.isMine) {
      gGame.livesCount++
      lastMove.cell.isMarked = false
    }

    renderLives()
    hideCellByLoc(lastMove.location)
  }
}
