// Icing prices, icing1 unlocked by default
const ICING_PRICES = { 1: 0, 2: 50, 3: 100 };

const icingOptionsEl = document.getElementById("icing-options");
const walletDisplay = document.getElementById("wallet-display");
const buyMsg = document.getElementById("buy-msg");

function getWallet() {
  return parseInt(localStorage.getItem("walletCoins") || "0", 10);
}

function setWallet(amount) {
  localStorage.setItem("walletCoins", amount);
  walletDisplay.textContent = amount;
}

function getUnlockedIcings() {
  const saved = localStorage.getItem("unlockedIcings");
  return saved ? JSON.parse(saved) : ["1"];
}

function unlockIcing(id) {
  const unlocked = getUnlockedIcings();
  if (!unlocked.includes(id)) {
    unlocked.push(id);
    localStorage.setItem("unlockedIcings", JSON.stringify(unlocked));
  }
}

// Builds the icing sidebar
function renderIcingOptions() {
  icingOptionsEl.innerHTML = "";
  const unlocked = getUnlockedIcings();

  [1, 2, 3].forEach((num) => {
    const id = String(num);
    const isUnlocked = unlocked.includes(id);
    const price = ICING_PRICES[num];

    const wrapper = document.createElement("div");
    wrapper.className = "icing-slot";

    const img = document.createElement("img");
    img.src = `assets/cake-decorator/icing${num}.png`;
    img.className = "icing-swatch" + (isUnlocked ? "" : " locked");
    img.dataset.icing = id;

    wrapper.appendChild(img);

    if (!isUnlocked) {
      const priceTag = document.createElement("span");
      priceTag.className = "icing-price";
      priceTag.innerHTML = `🔒 ${price}`;
      wrapper.appendChild(priceTag);
    }

    wrapper.addEventListener("click", () => handleIcingClick(id, isUnlocked, price));
    icingOptionsEl.appendChild(wrapper);
  });
}

// Selects an unlocked icing, or attempts to buy a locked one
function handleIcingClick(id, isUnlocked, price) {
  if (isUnlocked) {
    selectIcing(id);
    return;
  }

  const wallet = getWallet();
  if (wallet >= price) {
    setWallet(wallet - price);
    unlockIcing(id);
    showBuyMsg(`Unlocked! 🎉`);
    renderIcingOptions();
    selectIcing(id);
  } else {
    showBuyMsg(`Not enough coins — need ${price - wallet} more!`);
  }
}

function selectIcing(id) {
  document.querySelectorAll(".cake-icing").forEach((el) => el.classList.add("hidden"));
  document.getElementById(`cake-icing-${id}`).classList.remove("hidden");

  document.querySelectorAll(".icing-swatch").forEach((el) => el.classList.remove("selected"));
  document.querySelector(`.icing-swatch[data-icing="${id}"]`).classList.add("selected");
}

function showBuyMsg(text) {
  buyMsg.textContent = text;
  buyMsg.classList.remove("hidden");
  setTimeout(() => buyMsg.classList.add("hidden"), 1800);
}

walletDisplay.textContent = getWallet();
renderIcingOptions();