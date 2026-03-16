/* ========= GLOBAL STATE ========= */
const boardEl = document.getElementById("board");
const messageEl = document.getElementById("message");
const turnEl = document.getElementById("turnIndicator");

const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDrawEl = document.getElementById("scoreDraw");

const modeSelect = document.getElementById("modeSelect");
const themeToggle = document.getElementById("themeToggle");
const soundToggle = document.getElementById("soundToggle");

const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");
const drawSound = document.getElementById("drawSound");

let board = Array(9).fill(null);
let currentPlayer = "X";
let gameActive = true;
let soundOn = true;

/* Separate scores for modes */
let scores = JSON.parse(localStorage.getItem("scores")) || {
  ai: { X: 0, O: 0, D: 0 },
  pvp: { X: 0, O: 0, D: 0 }
};

/* ========= INIT ========= */
function init() {
  boardEl.innerHTML = "";
  board.fill(null);
  gameActive = true;
  currentPlayer = "X";
  messageEl.textContent = "";
  updateTurn();

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleMove);
    boardEl.appendChild(cell);
  }

  updateScores();
}
init();

/* ========= GAME LOGIC ========= */
function handleMove(e) {
  const i = e.target.dataset.index;
  if (!gameActive || board[i]) return;

  playSound(clickSound);
  makeMove(i, currentPlayer);

  if (checkWin(currentPlayer)) return endGame(currentPlayer);
  if (board.every(Boolean)) return endGame("draw");

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurn();

  if (modeSelect.value === "ai" && currentPlayer === "O") {
    setTimeout(aiMove, 400);
  }
}

function makeMove(index, player) {
  board[index] = player;
  boardEl.children[index].textContent = player;
}

function aiMove() {
  let move = findBestMove();
  makeMove(move, "O");

  if (checkWin("O")) return endGame("O");
  if (board.every(Boolean)) return endGame("draw");

  currentPlayer = "X";
  updateTurn();
}

/* Simple win/block AI */
function findBestMove() {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (let p of ["O", "X"]) {
    for (let line of lines) {
      const [a,b,c] = line;
      const vals = [board[a], board[b], board[c]];
      if (vals.filter(v => v === p).length === 2 && vals.includes(null)) {
        return line[vals.indexOf(null)];
      }
    }
  }

  const empty = board.map((v,i) => v ? null : i).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function checkWin(player) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (let combo of wins) {
    if (combo.every(i => board[i] === player)) {
      combo.forEach(i => boardEl.children[i].classList.add("win"));
      return true;
    }
  }
  return false;
}

function endGame(result) {
  gameActive = false;
  const mode = modeSelect.value;

  if (result === "draw") {
    messageEl.textContent = "It's a Draw!";
    scores[mode].D++;
    playSound(drawSound);
  } else {
    messageEl.textContent = `${result} Wins!`;
    scores[mode][result]++;
    playSound(winSound);
  }

  localStorage.setItem("scores", JSON.stringify(scores));
  updateScores();
}

function updateTurn() {
  turnEl.textContent = `Player ${currentPlayer} Turn`;
}

/* ========= SCORES ========= */
function updateScores() {
  const s = scores[modeSelect.value];
  scoreXEl.textContent = s.X;
  scoreOEl.textContent = s.O;
  scoreDrawEl.textContent = s.D;
}

/* ========= UI CONTROLS ========= */
document.getElementById("restartBtn").onclick = () => {
  playSound(clickSound);
  init();
};

document.getElementById("resetScoresBtn").onclick = () => {
  playSound(clickSound);

  scores = { ai: {X:0,O:0,D:0}, pvp:{X:0,O:0,D:0} };
  localStorage.setItem("scores", JSON.stringify(scores));
  updateScores();
};

modeSelect.onchange = () => {
  updateScores();
  init();
};

/* ========= THEME ========= */
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.dataset.theme = savedTheme;

themeToggle.onclick = () => {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
};

/* ========= SOUND ========= */
soundToggle.onclick = () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? "🔊" : "🔇";
};

function playSound(sound) {
  if (!soundOn) return;
  sound.pause();
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

document.body.addEventListener("click", () => {
  clickSound.play().catch(() => {});
}, { once: true });