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

deriveRandomEyeTarget();

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

    animate();
  },
});

const btn = document.getElementById("valentine-btn") as HTMLButtonElement;

btn.addEventListener("mousedown", () => {
  closeness.target = 1;
});

btn.addEventListener("mouseup", () => {
  closeness.target = 0;
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
});

btn.addEventListener("touchend", () => {
  closeness.target = 0;
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

function animate() {
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
  console.log(rive.isPlaying);
  requestAnimationFrame(animate);
}

btn.addEventListener("click", () => {
  // alert("Super! 💖");
});
