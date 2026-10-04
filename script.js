const HUMAN = "X";
const AI = "O";

let board = Array(9).fill("");
let gameOver = false;
let playerTurn = true;
let scores = { X: 0, O: 0, D: 0 };

const cells = [...document.querySelectorAll(".cell")];
const statusEl = document.getElementById("status");
const thinkingEl = document.getElementById("aiThinking");
const difficultyEl = document.getElementById("difficulty");
const newGameBtn = document.getElementById("newGameBtn");
const playerScoreEl = document.getElementById("playerScore");
const aiScoreEl = document.getElementById("aiScore");
const drawScoreEl = document.getElementById("drawScore");

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function getResult(state) {
  for (const [a, b, c] of WIN_LINES) {
    if (state[a] && state[a] === state[b] && state[a] === state[c]) {
      return { winner: state[a], line: [a, b, c] };
    }
  }
  if (state.every(Boolean)) return { winner: "draw", line: [] };
  return null;
}

function render() {
  cells.forEach((cell, i) => {
    cell.textContent = board[i];
    cell.classList.remove("x", "o", "win");
    if (board[i]) cell.classList.add(board[i].toLowerCase());
    cell.disabled = gameOver || !playerTurn || Boolean(board[i]);
  });

  playerScoreEl.textContent = scores.X;
  aiScoreEl.textContent = scores.O;
  drawScoreEl.textContent = scores.D;
}

function finish(result) {
  gameOver = true;
  result.line.forEach(i => cells[i].classList.add("win"));

  if (result.winner === HUMAN) {
    scores.X++;
    statusEl.textContent = "You won! 🎉";
    thinkingEl.textContent = "AI was defeated.";
  } else if (result.winner === AI) {
    scores.O++;
    statusEl.textContent = "AI won. 🤖";
    thinkingEl.textContent = "Minimax found a winning path.";
  } else {
    scores.D++;
    statusEl.textContent = "Draw! 🤝";
    thinkingEl.textContent = "No winning move was available.";
  }
  render();
}

function makeMove(index, player) {
  board[index] = player;
  const result = getResult(board);
  if (result) {
    finish(result);
    return true;
  }
  return false;
}

function handleHumanMove(event) {
  if (gameOver || !playerTurn) return;

  const index = Number(event.currentTarget.dataset.index);
  if (board[index]) return;

  makeMove(index, HUMAN);
  if (gameOver) return;

  playerTurn = false;
  render();
  statusEl.textContent = "AI is thinking…";
  thinkingEl.textContent = "Evaluating possible moves…";

  window.setTimeout(() => {
    const aiMove = chooseAiMove();
    makeMove(aiMove, AI);
    if (gameOver) return;

    playerTurn = true;
    statusEl.textContent = "Your turn — you are X.";
    thinkingEl.textContent = "AI is ready.";
    render();
  }, 350);
}

function getEmptyCells(state) {
  return state.map((value, i) => value ? null : i).filter(i => i !== null);
}

function randomMove(state) {
  const empty = getEmptyCells(state);
  return empty[Math.floor(Math.random() * empty.length)];
}

function mediumMove(state) {
  // 70% optimal Minimax, 30% random.
  if (Math.random() < 0.7) return minimaxRoot(state);
  return randomMove(state);
}

function chooseAiMove() {
  const difficulty = difficultyEl.value;

  if (difficulty === "easy") return randomMove(board);
  if (difficulty === "medium") return mediumMove(board);
  return minimaxRoot(board);
}

function minimaxRoot(state) {
  let bestScore = -Infinity;
  let bestMove = null;

  for (const move of getEmptyCells(state)) {
    state[move] = AI;
    const score = minimax(state, false, 0);
    state[move] = "";

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(state, maximizing, depth) {
  const result = getResult(state);

  if (result) {
    if (result.winner === AI) return 10 - depth;
    if (result.winner === HUMAN) return depth - 10;
    return 0;
  }

  const empty = getEmptyCells(state);

  if (maximizing) {
    let best = -Infinity;
    for (const move of empty) {
      state[move] = AI;
      best = Math.max(best, minimax(state, false, depth + 1));
      state[move] = "";
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of empty) {
      state[move] = HUMAN;
      best = Math.min(best, minimax(state, true, depth + 1));
      state[move] = "";
    }
    return best;
  }
}

function resetRound() {
  board = Array(9).fill("");
  gameOver = false;
  playerTurn = true;
  statusEl.textContent = "Your turn — you are X.";
  thinkingEl.textContent = "AI is ready.";
  render();
}

cells.forEach(cell => cell.addEventListener("click", handleHumanMove));
newGameBtn.addEventListener("click", resetRound);
render();
