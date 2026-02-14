import { Rive } from "@rive-app/canvas";

const canvas = document.getElementById("rive-canvas") as HTMLCanvasElement;

const rive = new Rive({
  src: "/valentines/animation.riv",
  canvas: canvas,
  autoplay: true,
  onLoad: () => {
    rive.resizeDrawingSurfaceToCanvas();
  },
});

const btn = document.getElementById("valentine-btn") as HTMLButtonElement;
btn.addEventListener("click", () => {
  alert("Super! 💖");
});
