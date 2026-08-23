// Sweet types and point values
const MAX_LIVES = 3;

const SWEET_TYPES = [
  { img: "assets/sweet-catch/sweet1.png", points: 1, kind: "good" },
  { img: "assets/sweet-catch/sweet2.png", points: 1, kind: "good" },
  { img: "assets/sweet-catch/sweet3.png", points: 2, kind: "good" },
  { img: "assets/sweet-catch/sweet4.png", points: 2, kind: "good" },
  { img: "assets/sweet-catch/sweet5.png", points: 3, kind: "good" },
];

const SPECIAL_SWEET = {
  img: "assets/sweet-catch/ExtraPointsSweet.png", points: 5, kind: "good"
};

const BAD_TYPES = [
  { img: "assets/sweet-catch/BadObject1.png", kind: "bad" },
  { img: "assets/sweet-catch/BadObject2.png", kind: "bad" },
];

const ELIXIR = { img: "assets/sweet-catch/elixir.png", kind: "elixir" };

// Game state
let coins = 0;
let lives = MAX_LIVES;
let combo = 0;
let basketX = 0;
let basketSpeed = 8;
let leftHeld = false;
let rightHeld = false;
let activeItems = [];
let spawnTimer = null;
let gameRunning = true;
let paused = false;

// DOM references
const gameScreen = document.getElementById("game-screen");
const fallZone = document.getElementById("fall-zone");
const basket = document.getElementById("basket");
const coinDisplay = document.getElementById("coin-display");
const livesDisplay = document.getElementById("lives-display");
const comboText = document.getElementById("combo-text");
const gameOverOverlay = document.getElementById("game-over-overlay");
const finalScoreDisplay = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");
const pauseOverlay = document.getElementById("pause-overlay");
const resumeBtn = document.getElementById("resume-btn");
const restartPauseBtn = document.getElementById("restart-pause-btn");

// Forces absolute positioning so left/top movement works
function ensureAbsolutePositioning() {
  gameScreen.style.position = "relative";
  fallZone.style.position = "absolute";
  fallZone.style.inset = "0";
  basket.style.position = "absolute";
}

// Resets and starts a new round
function initGame() {
  ensureAbsolutePositioning();

  coins = 0;
  lives = MAX_LIVES;
  combo = 0;
  paused = false;
  basketX = gameScreen.clientWidth / 2 - 45;
  gameRunning = true;

  activeItems.forEach(item => item.el.remove());
  activeItems = [];

  updateCoinDisplay();
  updateLivesDisplay();
  gameOverOverlay.classList.add("hidden");
  pauseOverlay.classList.add("hidden");

  clearTimeout(spawnTimer);
  scheduleNextSpawn();

  requestAnimationFrame(gameLoop);
}

// Basket movement (keyboard)
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") leftHeld = true;
  if (e.key === "ArrowRight") rightHeld = true;
  if (e.key === "Escape" && gameRunning) togglePause();
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") leftHeld = false;
  if (e.key === "ArrowRight") rightHeld = false;
});

function updateBasketPosition() {
  if (leftHeld) basketX -= basketSpeed;
  if (rightHeld) basketX += basketSpeed;

  const maxX = gameScreen.clientWidth - basket.clientWidth;
  basketX = Math.max(0, Math.min(basketX, maxX));

  basket.style.left = basketX + "px";
}

// Pause menu
function togglePause() {
  paused = !paused;
  if (paused) {
    clearTimeout(spawnTimer);
    pauseOverlay.classList.remove("hidden");
  } else {
    pauseOverlay.classList.add("hidden");
    scheduleNextSpawn();
  }
}

resumeBtn.addEventListener("click", () => {
  if (paused) togglePause();
});

restartPauseBtn.addEventListener("click", () => {
  pauseOverlay.classList.add("hidden");
  initGame();
});

// Difficulty scales with coins collected
function getDifficulty() {
  if (coins < 15)  return { spawnRate: 1500, fallSpeed: 2.0, specialChance: 0 };
  if (coins < 30)  return { spawnRate: 1300, fallSpeed: 2.3, specialChance: 0.03 };
  if (coins < 45)  return { spawnRate: 1150, fallSpeed: 2.6, specialChance: 0.05 };
  if (coins < 60)  return { spawnRate: 1000, fallSpeed: 2.9, specialChance: 0.07 };
  if (coins < 80)  return { spawnRate: 850,  fallSpeed: 3.3, specialChance: 0.09 };
  if (coins < 100) return { spawnRate: 700,  fallSpeed: 3.7, specialChance: 0.11 };
  return                  { spawnRate: 600,  fallSpeed: 4.2, specialChance: 0.13 };
}

// Spawning falling items
function scheduleNextSpawn() {
  const { spawnRate } = getDifficulty();
  spawnTimer = setTimeout(() => {
    if (gameRunning && !paused) {
      spawnItem();
      scheduleNextSpawn();
    }
  }, spawnRate);
}

function spawnItem() {
  const { specialChance } = getDifficulty();
  const roll = Math.random();

  const elixirSlot = specialChance + 0.08;
  const badSlot = elixirSlot + 0.25;

  let type;
  if (roll < specialChance) {
    type = SPECIAL_SWEET;
  } else if (lives < MAX_LIVES && roll < elixirSlot) {
    type = ELIXIR;
  } else if (roll < badSlot) {
    type = BAD_TYPES[Math.floor(Math.random() * BAD_TYPES.length)];
  } else {
    type = SWEET_TYPES[Math.floor(Math.random() * SWEET_TYPES.length)];
  }

  const el = document.createElement("img");
  el.src = type.img;
  el.className = "falling-item";
  el.style.position = "absolute";

  const maxLeft = gameScreen.clientWidth - 55;
  el.style.left = Math.random() * maxLeft + "px";
  el.style.top = "-70px";

  fallZone.appendChild(el);
  activeItems.push({ el, type, y: -70 });
}

// Main loop: movement, falling, collision
function gameLoop() {
  if (!gameRunning) return;

  if (paused) {
    requestAnimationFrame(gameLoop);
    return;
  }

  updateBasketPosition();

  const { fallSpeed } = getDifficulty();
  const basketRect = basket.getBoundingClientRect();

  for (let i = activeItems.length - 1; i >= 0; i--) {
    const item = activeItems[i];
    item.y += fallSpeed;
    item.el.style.top = item.y + "px";

    const itemRect = item.el.getBoundingClientRect();

    if (isColliding(itemRect, basketRect)) {
      handleCatch(item);
      removeItem(i);
      continue;
    }

    if (item.y > gameScreen.clientHeight) {
      handleMiss(item);
      removeItem(i);
    }
  }

  requestAnimationFrame(gameLoop);
}

function isColliding(a, b) {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}

function removeItem(index) {
  activeItems[index].el.remove();
  activeItems.splice(index, 1);
}

// Catch and miss outcomes
function handleCatch(item) {
  if (item.type.kind === "good") {
    coins += item.type.points;
    combo++;
    if (combo > 0 && combo % 5 === 0) {
      coins += 5;
      showComboText("STREAK! +5");
    } else {
      showComboText(`x${combo} combo!`);
    }
  } else if (item.type.kind === "elixir") {
    if (lives < MAX_LIVES) {
      lives++;
      updateLivesDisplay();
    }
    showComboText("❤️ +1 Life!");
  } else {
    coins = Math.max(0, coins - 2);
    loseLife();
    combo = 0;
  }
  updateCoinDisplay();
}

function handleMiss(item) {
  if (item.type.kind === "good") {
    combo = 0;
  }
}

function loseLife() {
  lives--;
  updateLivesDisplay();
  if (lives <= 0) endGame();
}

// HUD updates
function updateCoinDisplay() {
  coinDisplay.textContent = coins;
}

function updateLivesDisplay() {
  livesDisplay.innerHTML = "";
  for (let i = 0; i < lives; i++) {
    const heart = document.createElement("img");
    heart.src = "assets/sweet-catch/heart.png";
    livesDisplay.appendChild(heart);
  }
}

function showComboText(msg) {
  comboText.textContent = msg;
  comboText.classList.add("show");
  clearTimeout(showComboText._timer);
  showComboText._timer = setTimeout(() => comboText.classList.remove("show"), 700);
}

// Game over: save wallet and high score
function endGame() {
  gameRunning = false;
  clearTimeout(spawnTimer);
  finalScoreDisplay.textContent = coins;
  gameOverOverlay.classList.remove("hidden");

  const wallet = parseInt(localStorage.getItem("walletCoins") || "0", 10);
  localStorage.setItem("walletCoins", wallet + coins);

  const highScore = parseInt(localStorage.getItem("highScore") || "0", 10);
  if (coins > highScore) {
    localStorage.setItem("highScore", coins);
  }
}

restartBtn.addEventListener("click", initGame);

initGame();