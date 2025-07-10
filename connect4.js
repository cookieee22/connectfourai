const ROWS = 6;
const COLS = 7;
const PLAYER = 1;
const AI = 2;
const EMPTY = 0;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
let currentPlayer = PLAYER;
let gameOver = false;
let winningCells = [];
let humanScore = 0;
let aiScore = 0;

const humanScoreEl = document.getElementById("humanScore");
const aiScoreEl = document.getElementById("aiScore");

const gameDiv = document.getElementById("game");
const statusDiv = document.getElementById("status");
const restartBtn = document.getElementById("restart");

restartBtn.addEventListener("click", resetGame);

/** feature that resets the game **/
function resetGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
  currentPlayer = PLAYER;
  gameOver = false;
  winningCells = [];
  statusDiv.textContent = "";
  drawBoard();
}

/** score update **/
function updateScores() {
  humanScoreEl.textContent = humanScore;
  aiScoreEl.textContent = aiScore;
}

function drawBoard() {
  gameDiv.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (board[r][c] === PLAYER) cell.classList.add("red");
      if (board[r][c] === AI) cell.classList.add("yellow");
      if (winningCells.some(pos => pos[0] === r && pos[1] === c)) {
        cell.style.border = "4px solid green";
      }
      cell.addEventListener("click", () => handleClick(c));
      gameDiv.appendChild(cell);
    }
  }
}

function handleClick(col) {
  if (gameOver) return;

  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === EMPTY) {
      board[r][col] = PLAYER;
      if (isWinningMove(board, PLAYER)) {
        statusDiv.textContent = "You win!";
        gameOver = true;
        humanScore++;   /**incrementing value **/
        updateScores();  /** call feature :) **/
      } else {
        currentPlayer = AI;
        drawBoard();
        setTimeout(aiMove, 300);
      }
      break;
    }
  }
  drawBoard();
}

function aiMove() {
  if (gameOver) return;

  const [col, _] = minimax(board, 4, -Infinity, Infinity, true);
  if (col === null) return;

  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === EMPTY) {
      board[r][col] = AI;
      if (isWinningMove(board, AI)) {
        statusDiv.textContent = "AI wins!";
        gameOver = true;
        aiScore++;
        updateScores(); /**added two features for the scoreboard to both handleclick and aimove functions **/
      } else {
        currentPlayer = PLAYER;
      }
      break;
    }
  }
  drawBoard();
}

function isWinningMove(board, piece) {
  winningCells = [];

  // horizontal
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS - 3; c++)
      if (
        board[r][c] === piece &&
        board[r][c + 1] === piece &&
        board[r][c + 2] === piece &&
        board[r][c + 3] === piece
      ) {
        winningCells = [[r,c],[r,c+1],[r,c+2],[r,c+3]];
        return true;
      }

  // vertical
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r < ROWS - 3; r++)
      if (
        board[r][c] === piece &&
        board[r+1][c] === piece &&
        board[r+2][c] === piece &&
        board[r+3][c] === piece
      ) {
        winningCells = [[r,c],[r+1,c],[r+2,c],[r+3,c]];
        return true;
      }

  // positive diagonal
  for (let r = 3; r < ROWS; r++)
    for (let c = 0; c < COLS - 3; c++)
      if (
        board[r][c] === piece &&
        board[r-1][c+1] === piece &&
        board[r-2][c+2] === piece &&
        board[r-3][c+3] === piece
      ) {
        winningCells = [[r,c],[r-1,c+1],[r-2,c+2],[r-3,c+3]];
        return true;
      }

  // negative diagonal
  for (let r = 0; r < ROWS - 3; r++)
    for (let c = 0; c < COLS - 3; c++)
      if (
        board[r][c] === piece &&
        board[r+1][c+1] === piece &&
        board[r+2][c+2] === piece &&
        board[r+3][c+3] === piece
      ) {
        winningCells = [[r,c],[r+1,c+1],[r+2,c+2],[r+3,c+3]];
        return true;
      }

  return false;
}

function getValidMoves(board) {
  const validMoves = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === EMPTY) {
      validMoves.push(c);
    }
  }
  return validMoves;
}

function getOpenRow(board, col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === EMPTY) return r;
  }
  return null;
}

//Score Window layout//
function scoreWindow(window, playerPiece, aiPiece) {
  let score = 0;
  const opponent = playerPiece !== aiPiece ? playerPiece : "0";
  
  const aiCount = window.filter(cell => cell === aiPiece).length;
  const opponentCount = window.filter(cell => cell === opponent).length;
  const emptyCount = window.filter(cell => cell === EMPTY).length;

  if (aiCount === 4) score += 100;
  else if (aiCount === 3 && emptyCount === 1) score += 10;
  else if (aiCount === 2 && emptyCount === 2) score += 5;

  if (opponentCount === 3 && emptyCount === 1) score -= 80;

  return score;
}

function evaluateBoard(board, piece) {
  let score = 0;

  const centerCol = [];
  for (let r = 0; r < ROWS; r++) {
    centerCol.push(board[r][Math.floor(COLS/2)]);
  }
  const centerCount = centerCol.filter(v => v === piece).length;
  score += centerCount * 3;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = board[r].slice(c, c + 4);
      score += scoreWindow(window, PLAYER, AI);
    }
  }

  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      const window = [
        board[r][c],
        board[r+1][c],
        board[r+2][c],
        board[r+3][c]
      ];
      score += scoreWindow(window, PLAYER, AI);
    }
  }

  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [
        board[r][c],
        board[r-1][c+1],
        board[r-2][c+2],
        board[r-3][c+3]
      ];
      score += scoreWindow(window, PLAYER, AI);
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [
        board[r][c],
        board[r+1][c+1],
        board[r+2][c+2],
        board[r+3][c+3]
      ];
      score += scoreWindow(window, PLAYER, AI);
    }
  }

  return score;
}

function minimax(board, depth, alpha, beta, maximizing) {
  const validMoves = getValidMoves(board);
  const isTerminal =
    isWinningMove(board, PLAYER) ||
    isWinningMove(board, AI) ||
    validMoves.length === 0;

  if (depth === 0 || isTerminal) {
    if (isWinningMove(board, AI)) return [null, 1000000];
    if (isWinningMove(board, PLAYER)) return [null, -1000000];
    return [null, evaluateBoard(board, AI)];
  }

  if (maximizing) {
    let bestScore = -Infinity;
    let bestCol = validMoves[Math.floor(Math.random() * validMoves.length)];
    for (const col of validMoves) {
      const row = getOpenRow(board, col);
      const tempBoard = board.map(r => [...r]);
      tempBoard[row][col] = AI;
      const [_, newScore] = minimax(tempBoard, depth - 1, alpha, beta, false);
      if (newScore > bestScore) {
        bestScore = newScore;
        bestCol = col;
      }
      alpha = Math.max(alpha, bestScore);
      if (alpha >= beta) break;
    }
    return [bestCol, bestScore];
  } else {
    let bestScore = Infinity;
    let bestCol = validMoves[Math.floor(Math.random() * validMoves.length)];
    for (const col of validMoves) {
      const row = getOpenRow(board, col);
      const tempBoard = board.map(r => [...r]);
      tempBoard[row][col] = PLAYER;
      const [_, newScore] = minimax(tempBoard, depth - 1, alpha, beta, true);
      if (newScore < bestScore) {
        bestScore = newScore;
        bestCol = col;
      }
      beta = Math.min(beta, bestScore);
      if (alpha >= beta) break;
    }
    return [bestCol, bestScore];
  }
}

drawBoard();
updateScores(); /**call added here to intialize scoreb on page load **/