import { Application } from "@splinetool/runtime";

const canvas = document.getElementById("canvas3d");
const app = new Application(canvas);

app
  .load(
    "https://prod.spline.design/ObXxHCR3OWenQgGQ/scene.splinecode?v=" +
      Date.now()
  )
  .then(() => {
    const camera = app._scene.activeCamera;

    function updateCameraZoom() {
      if (!camera) return;
      const DESIGN_HEIGHT = 1920;
      camera.zoom = window.innerHeight / DESIGN_HEIGHT;
      camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", updateCameraZoom);
    updateCameraZoom();
  });
