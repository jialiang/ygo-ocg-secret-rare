const card = document.querySelector(".card");
const touchpad = document.querySelector(".touchpad");

touchpad.style.touchAction = "none";

let rotStepsLeft, lastRotTime, currentRotX, currentRotY, finalRotX, finalRotY;

let active = false;

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

const toDegrees = (radians) => (radians * 180) / Math.PI;

const readRot = () => {
  const matrix = new DOMMatrix(getComputedStyle(card).transform);

  currentRotX = toDegrees(Math.atan2(matrix.m23, matrix.m22));
  currentRotY = toDegrees(Math.atan2(matrix.m31, matrix.m11));
};

const rot = (now) => {
  if (!active) return;

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
  raf("rot");

  raf("move", (now) => {
    const rect = touchpad.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dxyMax = Math.hypot(centerX, centerY);

    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      return end();
    }

    if (!active) {
      readRot();
      applyRot();
    }

    active = true;

    const x = Math.round(e.clientX - rect.left - centerX);
    const y = Math.round(e.clientY - rect.top - centerY);

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

const end = () => {
  if (!active) return;

  active = false;

  raf("move");
  raf("rot");

  raf("end", () => {
    card.classList.remove("mouseover");
    card.style.cssText = "";

    resetRot();
  });
};

touchpad.addEventListener("pointerenter", move);
touchpad.addEventListener("pointermove", move);
touchpad.addEventListener("pointerleave", end);
touchpad.addEventListener("pointercancel", end);
