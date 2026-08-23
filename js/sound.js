const SOUND_FILES = {
  bgmusic: "assets/sounds/bgmusic.mp3",
};

function isMuted() {
  return localStorage.getItem("muted") === "true";
}

function setMuted(muted) {
  localStorage.setItem("muted", muted ? "true" : "false");
  const bg = document.getElementById("bg-music");
  if (bg) bg.muted = muted;
}

// Creates and plays background music
function initBgMusic() {
  let bg = document.getElementById("bg-music");
  if (!bg) {
    bg = document.createElement("audio");
    bg.id = "bg-music";
    bg.src = SOUND_FILES.bgmusic;
    bg.loop = true;
    document.body.appendChild(bg);
  }
  bg.volume = 0.65;
  bg.muted = isMuted();

  bg.play().catch(() => {
    document.addEventListener("click", () => bg.play().catch(() => {}), { once: true });
  });
}

// Adds a mute button to the page
function injectMuteButton() {
  if (document.getElementById("global-mute-btn")) return;
  const frame = document.querySelector(".site-frame");
  if (!frame) return;

  const btn = document.createElement("button");
  btn.id = "global-mute-btn";
  btn.className = "global-mute-btn";
  btn.textContent = isMuted() ? "🔇" : "🔊";

  btn.addEventListener("click", () => {
    const nowMuted = !isMuted();
    setMuted(nowMuted);
    btn.textContent = nowMuted ? "🔇" : "🔊";
  });

  frame.appendChild(btn);
}

document.addEventListener("DOMContentLoaded", () => {
  initBgMusic();
  injectMuteButton();
});