import { Application } from "https://unpkg.com/@splinetool/runtime@1.9.12/build/runtime.js";
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import CustomEase from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/CustomEase.js";

gsap.registerPlugin(CustomEase);

const canvas = document.getElementById("canvas3d");
const app = new Application(canvas);

app
  .load(
    "https://prod.spline.design/X6X5SZM-ifxjYhT4/scene.splinecode?v=" +
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

    //---------------------------------------- INIT VARS
    //-------------------- OBJECTS

    // main sphere
    const main_group = app.findObjectByName("Group sphere");
    const main_sphere = app.findObjectByName("Sphere");

    // spheres
    const spheres = [];
    const repulsionDistance = 2222;
    for (let i = 2; i <= 45; i++) {
      const sphere = app.findObjectByName(`Sphere ${i}`);

      const mat = app._scene.entityByUuid[sphere.uuid].material;
      mat.transparent = true;
      mat.layers[1].uniforms.f1_alpha.value = 0;

      // calculate a repulsion path
      const start = {
        x: sphere.position.x,
        y: sphere.position.y,
        z: sphere.position.z,
      };

      const dx = start.x - main_group.position.x;
      const dy = start.y - main_group.position.y;
      const dz = start.z - main_group.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const end = {
        x: main_group.position.x + (dx / distance) * repulsionDistance,
        y: main_group.position.y + (dy / distance) * repulsionDistance,
        z: main_group.position.z + (dz / distance) * repulsionDistance,
      };

      const state = { value: 0 };

      // init spheres values
      sphere.position.set(end.x, end.y, end.z);
      sphere.scale.set(0.1, 0.1, 0.1);

      spheres.push({ sphere, start, end, state, mat });
    }

    // particles
    const bg = app.findObjectByName("Group bg");

    //-------------------- SPIN
    const baseSpeed = 0.02;
    const minMultiplier = 0.17;
    const maxMultiplier = 1.2;
    let multiplier = minMultiplier;
    const accel = 0.1;
    const decel = 0.02;

    let mouseDown = false;

    //---------------------------------------- INIT VALUES

    // main sphere
    main_group.scale.set(0.8, 0.8, 0.8);

    // particles
    app.setVariable("stars speed", 1);
    app.setVariable("glow speed", 0);

    bg.scale.set(0.7, 0.7, 0.7);

    //---------------------------------------- INIT LOOP

    gsap.ticker.add(() => {
      // spin
      if (mouseDown) {
        multiplier += accel;
        if (multiplier > maxMultiplier) multiplier = maxMultiplier;
        if (multiplier < minMultiplier) multiplier = minMultiplier;
      } else {
        multiplier -= decel;
        if (multiplier < minMultiplier) multiplier = minMultiplier;
      }
      main_sphere.rotation.y += baseSpeed * multiplier;
    });

    //---------------------------------------- MOUSE EVENTS

    //-------------------- DOWN

    app.addEventListener("mouseDown", (e) => {
      // scale main sphere
      gsap.to(main_group.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 5,
        ease: CustomEase.create("custom", "M0,0 C0.2,0 0,1.01 1,1 "),
        overwrite: "auto",
      });

      // pull spheres in
      spheres.forEach(({ sphere, start, state, mat }, i) => {
        const duration = 2 + Math.random() * 3;
        const easeOptions = ["power2.inOut", "power3.inOut"];
        const ease =
          easeOptions[Math.floor(Math.random() * easeOptions.length)];

        gsap
          .timeline()
          .to(
            sphere.position,
            {
              x: start.x,
              y: start.y,
              z: start.z,
              duration,
              ease,
              overwrite: "auto",
            },
            0
          )
          .to(
            sphere.scale,
            {
              x: 1,
              y: 1,
              z: 1,
              duration,
              ease,
              overwrite: "auto",
            },
            0
          );

        gsap.to(state, {
          value: 1,
          duration: 5,
          ease,
          overwrite: "auto",
          onUpdate: () => {
            mat.layers[1].uniforms.f1_alpha.value = state.value;
          },
        });
      });

      app.setVariable("stars speed", 2);
      app.setVariable("glow speed", 3);

      gsap.to(bg.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 5,
        ease: CustomEase.create("custom", "M0,0 C0.2,0 0,1.01 1,1 "),
        overwrite: "auto",
      });

      mouseDown = true;
    });

    //-------------------- UP

    window.addEventListener("mouseup", () => {
      // scale main sphere back
      gsap.to(main_group.scale, {
        x: 0.8,
        y: 0.8,
        z: 0.8,
        duration: 3.5,
        ease: "expo.out",
        overwrite: "auto",
      });

      // push spheres out
      spheres.forEach(({ sphere, end, state, mat }, i) => {
        gsap
          .timeline()
          .to(
            sphere.position,
            {
              x: end.x,
              y: end.y,
              z: end.z,
              duration: 2.5,
              ease: "expo.out",
              overwrite: "auto",
            },
            0
          )
          .to(
            sphere.scale,
            {
              x: 0.1,
              y: 0.1,
              z: 0.1,
              duration: 2.5,
              ease: "expo.out",
              overwrite: "auto",
            },
            0
          );

        gsap.to(state, {
          value: 0,
          duration: 2.5,
          ease: "expo.out",
          overwrite: "auto",
          onUpdate: () => {
            mat.layers[1].uniforms.f1_alpha.value = state.value;
          },
        });
      });

      app.setVariable("stars speed", 1);
      app.setVariable("glow speed", 0);

      gsap.to(bg.scale, {
        x: 0.7,
        y: 0.7,
        z: 0.7,
        duration: 3.5,
        ease: "expo.out",
        overwrite: "auto",
      });

      mouseDown = false;
    });
  });
