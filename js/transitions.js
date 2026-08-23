function createCurtain() {
  const curtain = document.createElement("div");
  curtain.className = "page-curtain";
  document.body.appendChild(curtain);
  return curtain;
}

// Plays on page load
window.addEventListener("DOMContentLoaded", () => {
  const curtain = createCurtain();
  curtain.classList.add("curtain-enter");
  curtain.addEventListener("animationend", () => curtain.remove(), { once: true });
});

// Plays before navigating to a new page
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-transition]");
  if (!link) return;
  e.preventDefault();

  const href = link.getAttribute("href");
  const curtain = createCurtain();
  curtain.classList.add("curtain-leave");
  curtain.addEventListener(
    "animationend",
    () => { window.location.href = href; },
    { once: true }
  );
});