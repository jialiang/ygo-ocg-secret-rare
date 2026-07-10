const card = document.querySelector(".card");
const touchpad = document.querySelector(".touchpad");

let rotStepsLeft, lastRotTime, currentRotX, currentRotY, finalRotX, finalRotY;

let lastStart = 0;
let lastEnd = 0;

const lastRafId = {
  rot: 0,
  move: 0,
  end: 0,
};

const raf = (key, callback) => {
  cancelAnimationFrame(lastRafId[key]);

  if (callback) lastRafId[key] = requestAnimationFrame(callback);
};

const resetRot = () => {
  rotStepsLeft = 300;
  lastRotTime = 0;

  currentRotX = 0;
  currentRotY = 0;

  finalRotX = 0;
  finalRotY = 0;
};

resetRot();

const applyRot = () => {
  card.style.setProperty("--rot-x", `${currentRotX.toFixed(2)}deg`);
  card.style.setProperty("--rot-y", `${currentRotY.toFixed(2)}deg`);
};

const rot = (now) => {
  if (lastEnd > lastStart) return;

  if (rotStepsLeft <= 0) {
    currentRotX = finalRotX;
    currentRotY = finalRotY;

    applyRot();
    return;
  }

  if (lastRotTime === 0) lastRotTime = now;

  const elapsed = now - lastRotTime;

  if (elapsed <= 4) return raf("rot", rot);

  const dRotX = (finalRotX - currentRotX) * Math.min(1, elapsed / rotStepsLeft);
  const dRotY = (finalRotY - currentRotY) * Math.min(1, elapsed / rotStepsLeft);

  currentRotX += dRotX;
  currentRotY += dRotY;
  rotStepsLeft -= elapsed;
  lastRotTime = now;

  raf("rot", rot);
  applyRot();
};

const move = (e) => {
  e.preventDefault();

  if (lastEnd >= lastStart) lastStart = performance.now();

  raf("rot");

  raf("move", (now) => {
    if (lastEnd >= lastStart) return;

    const rect = touchpad.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dxyMax = Math.hypot(centerX, centerY);

    let rawX, rawY;

    if (e.type === "mousemove") {
      rawX = e.clientX;
      rawY = e.clientY;
    }

    if (e.type === "touchmove") {
      rawX = e.touches[0].clientX;
      rawY = e.touches[0].clientY;

      if (rawX < rect.left || rawX > rect.right || rawY < rect.top || rawY > rect.bottom) {
        return end();
      }
    }

    const x = Math.round(rawX - rect.left - centerX);
    const y = Math.round(rawY - rect.top - centerY);

    let o = Math.round((1.825 - Math.hypot(x, y) / dxyMax) * 100) / 100;

    if (o === 0.9) o = 0.91;

    finalRotX = (y / centerY) * 3;
    finalRotY = (x / centerX) * -3;

    rot(now);

    card.classList.add("mouseover");

    card.style.setProperty("--x", `${x * 1.25}px`);
    card.style.setProperty("--y", `${y * 1.25}px`);
    card.style.setProperty("--o", `${o}`);
  });
};

const start = () => {
  lastStart = performance.now();
};

const end = () => {
  lastEnd = performance.now();

  raf("end", () => {
    if (lastStart > lastEnd) return;

    card.classList.remove("mouseover");
    card.style.cssText = "";

    resetRot();
  });
};

touchpad.addEventListener("mouseenter", start, { passive: true });
touchpad.addEventListener("touchstart", start, { passive: true });

touchpad.addEventListener("mousemove", move);
touchpad.addEventListener("touchmove", move);

touchpad.addEventListener("mouseleave", end, { passive: true });
touchpad.addEventListener("touchend", end, { passive: true });
touchpad.addEventListener("touchcancel", end, { passive: true });
