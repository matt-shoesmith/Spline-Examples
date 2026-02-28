import { Application } from "https://unpkg.com/@splinetool/runtime@1.9.12/build/runtime.js";
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import CustomEase from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/CustomEase.js";

gsap.registerPlugin(CustomEase);

const canvas = document.getElementById("canvas3d");
const app = new Application(canvas);
app
  .load(
    "https://prod.spline.design/awcw6pkcZo2mncQ8/scene.splinecode?v=" +
      Date.now()
  )
  .then(() => {
    const camera = app._scene.activeCamera;
    function updateCameraZoom() {
      const camera = app._scene.activeCamera;
      if (!camera) return;
      const DESIGN_HEIGHT = 1920;
      camera.zoom = window.innerHeight / DESIGN_HEIGHT;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", updateCameraZoom);
    updateCameraZoom();
  });
