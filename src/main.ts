import { Rive, ViewModelInstanceNumber } from "@rive-app/canvas";

const canvas = document.getElementById("rive-canvas") as HTMLCanvasElement;

interface SpringValue {
  current: number;
  target: number;
  velocity: number;
}

const createSpring = (initial: number): SpringValue => ({
  current: initial,
  target: initial,
  velocity: 0,
});

const updateSpring = (
  spring: SpringValue,
  tension: number = 0.1,
  friction: number = 0.8,
): void => {
  const force = (spring.target - spring.current) * tension;
  spring.velocity += force;
  spring.velocity *= friction;
  spring.current += spring.velocity;
};

let closenessInput: ViewModelInstanceNumber | null = null;
let eyeTargetXInput: ViewModelInstanceNumber | null = null;
let eyeTargetYInput: ViewModelInstanceNumber | null = null;

const closeness = { current: 0, target: 0 };
const eyeTargetX = createSpring(0);
const eyeTargetY = createSpring(0);

let isHovered = false;
let isButtonHeld = false;

interface HeartParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  element: SVGElement;
}

const hearts: HeartParticle[] = [];
let heartContainer: HTMLDivElement | null = null;

function createHeartContainer() {
  heartContainer = document.createElement("div");
  heartContainer.style.position = "absolute";
  heartContainer.style.top = "0";
  heartContainer.style.left = "0";
  heartContainer.style.width = "100%";
  heartContainer.style.height = "100%";
  heartContainer.style.pointerEvents = "none";
  heartContainer.style.overflow = "none";
  document.getElementById("app")?.appendChild(heartContainer);
}

function createHeartSVG(): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "24");
  svg.setAttribute("height", "24");
  svg.style.fill = "#ff69b4";
  svg.innerHTML =
    '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>';
  return svg;
}

function spawnHeart() {
  if (!heartContainer) return;

  const rect = canvas.getBoundingClientRect();
  const containerRect = heartContainer.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2 - containerRect.left;
  const centerY = rect.top + rect.height / 2 - containerRect.top;
  console.log(centerX);

  const heartEl = createHeartSVG();
  heartEl.style.position = "absolute";
  heartEl.style.left = `0px`;
  heartEl.style.top = `0px`;
  heartContainer.appendChild(heartEl);

  const heart: HeartParticle = {
    x: centerX + (Math.random() - 0.5) * 40,
    y: centerY + (Math.random() - 0.5) * 20,
    vx: (Math.random() - 0.5) * 2,
    vy: -2 - Math.random() * 2,
    scale: 0.5 + Math.random() * 0.8,
    opacity: 1,
    rotation: (Math.random() - 0.5) * 30,
    rotationSpeed: (Math.random() - 0.5) * 2,
    element: heartEl,
  };

  updateHeartTransform(heart);
  hearts.push(heart);
}

function updateHeartTransform(heart: HeartParticle) {
  heart.element.style.transform = `translate(${heart.x}px, ${heart.y}px) scale(${heart.scale}) rotate(${heart.rotation}deg)`;
  heart.element.style.opacity = String(heart.opacity);
}

function updateHearts() {
  for (let i = hearts.length - 1; i >= 0; i--) {
    const heart = hearts[i];

    heart.x += heart.vx;
    heart.y += heart.vy;
    heart.rotation += heart.rotationSpeed;
    heart.scale *= 0.995;
    heart.opacity -= 0.01;

    updateHeartTransform(heart);

    if (heart.opacity <= 0) {
      heart.element.remove();
      hearts.splice(i, 1);
    }
  }
}

let lastSpawnTime = 0;
function maybeSpawnHeart(timestamp: number) {
  if (isButtonHeld && timestamp - lastSpawnTime > 50) {
    spawnHeart();
    lastSpawnTime = timestamp;
  }
}

deriveRandomEyeTarget();
createHeartContainer();

const rive = new Rive({
  src: "/valentines/animation.riv",
  canvas: canvas,
  autoplay: true,
  autoBind: true,
  stateMachines: "State Machine 1",
  onLoad: () => {
    rive.resizeDrawingSurfaceToCanvas();

    const vmi = rive.viewModelInstance;
    if (!vmi) {
      throw new Error("Failed to load default view model");
    }

    closenessInput = vmi.number("closeness");
    eyeTargetXInput = vmi.number("eyeTargetX");
    eyeTargetYInput = vmi.number("eyeTargetY");

    window.addEventListener("resize", () => {
      rive.resizeDrawingSurfaceToCanvas();
    });

    requestAnimationFrame(animate);
  },
});

const btn = document.getElementById("valentine-btn") as HTMLButtonElement;

btn.addEventListener("mousedown", () => {
  closeness.target = 1;
  isButtonHeld = true;
});

btn.addEventListener("mouseup", () => {
  closeness.target = 0;
  isButtonHeld = false;
});

btn.addEventListener("mouseleave", () => {
  closeness.target = 0;
  isHovered = false;
  updateEyeTargetHover();
});

btn.addEventListener("mouseenter", () => {
  isHovered = true;
  updateEyeTargetHover();
});

btn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  closeness.target = 1;
  isButtonHeld = true;
});

btn.addEventListener("touchend", () => {
  closeness.target = 0;
  isButtonHeld = false;
});

function deriveRandomEyeTarget() {
  if (!isHovered) {
    const angle = Math.random() * Math.PI * 2;
    eyeTargetX.target = Math.cos(angle) * 200;
    eyeTargetY.target = Math.sin(angle) * 200;
  }
}

function updateEyeTargetHover() {
  if (isHovered) {
    eyeTargetX.target = 0;
    eyeTargetY.target = 0;
  } else {
    deriveRandomEyeTarget();
  }
}

setInterval(() => {
  deriveRandomEyeTarget();
}, 1000);

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

function animate(timestamp: number) {
  closeness.current = lerp(closeness.current, closeness.target, 0.1);

  updateSpring(eyeTargetX, 0.08, 0.85);
  updateSpring(eyeTargetY, 0.08, 0.85);

  if (closenessInput) {
    closenessInput.value = closeness.current;
  }
  if (eyeTargetXInput) {
    eyeTargetXInput.value = eyeTargetX.current;
  }
  if (eyeTargetYInput) {
    eyeTargetYInput.value = eyeTargetY.current;
  }

  maybeSpawnHeart(timestamp);
  updateHearts();

  requestAnimationFrame(animate);
}

btn.addEventListener("click", () => {
  // alert("Super! 💖");
});
