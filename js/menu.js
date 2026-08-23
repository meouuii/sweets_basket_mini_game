// Guide carousel
const guideBtn = document.getElementById("guide-btn");
const guideOverlay = document.getElementById("guide-overlay");
const guideImg = document.getElementById("guide-img");
const guidePrevBtn = document.getElementById("guide-prev-btn");
const guideNextBtn = document.getElementById("guide-next-btn");
const guideOkBtn = document.getElementById("guide-ok-btn");

const TOTAL_GUIDE_PAGES = 3;
let guidePage = 1;

function renderGuidePage() {
  guideImg.src = `assets/main-menu/guide${guidePage}.png`;

  guidePrevBtn.classList.toggle("hidden", guidePage === 1);

  const isLastPage = guidePage === TOTAL_GUIDE_PAGES;
  guideNextBtn.classList.toggle("hidden", isLastPage);
  guideOkBtn.classList.toggle("hidden", !isLastPage);
}

guideBtn.addEventListener("click", () => {
  guidePage = 1;
  renderGuidePage();
  guideOverlay.classList.remove("hidden");
});

guideNextBtn.addEventListener("click", () => {
  if (guidePage < TOTAL_GUIDE_PAGES) {
    guidePage++;
    renderGuidePage();
  }
});

guidePrevBtn.addEventListener("click", () => {
  if (guidePage > 1) {
    guidePage--;
    renderGuidePage();
  }
});

guideOkBtn.addEventListener("click", () => {
  guideOverlay.classList.add("hidden");
});

// High score display
document.getElementById("high-score-display").textContent =
  localStorage.getItem("highScore") || "0";