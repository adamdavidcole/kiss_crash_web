import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import * as dat from "lil-gui";
import { ParallaxBarrierEffect } from "three/addons/effects/ParallaxBarrierEffect.js";
import gsap from "gsap";
import Splide from "@splidejs/splide";
import getCountry from "./get-country";

import "@splidejs/splide/css";

const threeDebug = false;

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
gui.hide();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Canvas
const canvas = document.querySelector("canvas.webgl");
if (threeDebug) {
  canvas.style.zIndex = 100;
}
// canvas.style.zIndex = 1;

// Scene
const scene = new THREE.Scene();

let effect;

/**
 * Helper Functions
 */
const size = new THREE.Vector3();
const center = new THREE.Vector3();
const box = new THREE.Box3();

function fitCameraToSelection(
  camera,
  controls,
  selection,
  fitOffset = 1.2,
  setPosition = true
) {
  box.makeEmpty();
  for (const object of selection) {
    box.expandByObject(object);
  }

  box.getSize(size);
  box.getCenter(center);

  const maxSize = Math.max(size.x, size.y, size.z);
  const fitHeightDistance =
    maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  fitOffset = 1.4;
  let distance = fitOffset * Math.min(fitHeightDistance, fitWidthDistance);
  if (sizes.height > sizes.width) {
    fitOffset = 1;
    distance = fitOffset * 0.8 * Math.max(fitHeightDistance, fitWidthDistance);
  }

  const direction = controls.target
    .clone()
    .sub(camera.position)
    .normalize()
    .multiplyScalar(distance);

  if (setPosition) {
    controls.maxDistance = distance * 10;
    controls.target.copy(center);
    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.updateProjectionMatrix();

    camera.position.copy(controls.target).sub(direction);

    scene.fog.near = camera.position.z * 2;

    controls.update();
  } else {
    // controls.update();

    return center.sub(direction).z;
  }
}

/**
 * Video Textures
 */
const kissCrashVideo = document.getElementById("kiss_crash_video");
// kissCrashVideo.currentTime = 3;
// kissCrashVideo.play();
// let hasKissCrashVideoLoaded = false;

// // kissCrashVideo.addEventListener("play", function () {
// // this.currentTime = 3;
// // });
const slowKissVideo = document.getElementById("slow_kiss_video");
// slowKissVideo.currentTime = 0;
// slowKissVideo.play();
// let hasSlowKissVideoLoaded = false;

// kissCrashVideo.onplaying = function () {
//   console.log("kiss/crash video is now loaded and playing");
//   hasKissCrashVideoLoaded = true;

//   if (hasKissCrashVideoLoaded && hasSlowKissVideoLoaded) {
//     enableEnter();
//   }
// };
// slowKissVideo.onplaying = function () {
//   console.log("me kissing me video is now loaded and playing");
//   hasSlowKissVideoLoaded = true;

//   if (hasKissCrashVideoLoaded && hasSlowKissVideoLoaded) {
//     enableEnter();
//   }
// };
// slowKissVideo.addEventListener("play", function () {
//   this.currentTime = 0;
// });

const planeWidth = 5;
const planeHeight = planeWidth * (9 / 16);
const boxThickness = planeWidth * 0.03;

const kissCrashVideoTexture = new THREE.VideoTexture(kissCrashVideo);
const slowKKissVideoTexture = new THREE.VideoTexture(slowKissVideo);

/**
 * Video Meshes
 */
const horizontalShift = planeWidth * (3 / 4);
const verticalShift = planeWidth / 7;
const depthShift = planeWidth / 2;

// CENTRAL PLANE

const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
const kissCrashMaterial = new THREE.MeshBasicMaterial({
  // color: 0xffffff,
  side: THREE.DoubleSide,
  map: kissCrashVideoTexture,
});
const slowKissMaterial = new THREE.MeshBasicMaterial({
  //   color: 0xffffff,
  side: THREE.DoubleSide,
  map: slowKKissVideoTexture,
});

// ADJACENT PLANES
const boxShift = 0.01;
const boxGeometry = new THREE.BoxGeometry(
  planeWidth,
  planeHeight,
  boxThickness
);
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x232427 });

const centralPlane = new THREE.Mesh(planeGeometry, kissCrashMaterial);
const centralBox = new THREE.Mesh(boxGeometry, boxMaterial);
centralBox.position.set(
  centralPlane.position.x,
  centralPlane.position.y,
  centralPlane.position.z - boxThickness / 2 - boxShift
);
const centerGroup = new THREE.Group();
centerGroup.add(centralPlane);
centerGroup.add(centralBox);
centerGroup.position.set(0, verticalShift, 0);

// centralPlane.position.set(0, verticalShift, 0);
// scene.add(centralPlane);

const rightPlane = new THREE.Mesh(planeGeometry, slowKissMaterial);
const rightBox = new THREE.Mesh(boxGeometry, boxMaterial);
rightBox.position.set(
  rightPlane.position.x,
  rightPlane.position.y,
  rightPlane.position.z - boxThickness / 2 - boxShift
);

const rightGroup = new THREE.Group();
rightGroup.add(rightPlane);
rightGroup.add(rightBox);

// rightPlane.rotation.y = -Math.PI / 2;
// rightPlane.position.set(horizontalShift, verticalShift, depthShift);
// scene.add(rightPlane);

const leftPlane = new THREE.Mesh(planeGeometry, slowKissMaterial);
const leftBox = new THREE.Mesh(boxGeometry, boxMaterial);
leftBox.position.set(
  rightPlane.position.x,
  rightPlane.position.y,
  rightPlane.position.z - boxThickness / 2 - boxShift
);

const leftGroup = new THREE.Group();
leftGroup.add(leftPlane);
leftGroup.add(leftBox);

scene.add(centerGroup);
scene.add(rightGroup);
scene.add(leftGroup);

// leftPlane.rotation.y = -Math.PI / 2;
// leftPlane.position.set(-horizontalShift, verticalShift, depthShift);
// scene.add(leftPlane);

// BOXES
// const centralBox = new THREE.Mesh(boxGeometry, boxMaterial);
// centralBox.position.set(
//   centralPlane.position.x,
//   centralPlane.position.y,
//   centralPlane.position.z - boxThickness / 2 - boxShift
// );

// const leftBox = new THREE.Mesh(boxGeometry, boxMaterial);
// leftBox.position.set(
//   leftPlane.position.x - boxThickness / 2 - boxShift,
//   leftPlane.position.y,
//   leftPlane.position.z
// );
// leftBox.rotation.set(...leftPlane.rotation);

// const
centralBox.castShadow = true;
rightBox.castShadow = true;
leftBox.castShadow = true;
// scene.add(centralBox);
// scene.add(rightBox);
// scene.add(leftBox);

function positionBoxesForDesktop() {
  // set position
  centerGroup.position.set(0, verticalShift, 0);

  rightGroup.position.set(horizontalShift, verticalShift, depthShift);
  rightGroup.rotation.set(0, -Math.PI / 2, 0);
  rightPlane.rotation.set(0, 0, 0);

  leftGroup.position.set(-horizontalShift, verticalShift, depthShift);
  leftGroup.rotation.set(0, Math.PI / 2, 0);
}

function positionBoxesForMobile() {
  // set position
  centerGroup.position.set(0, 0, 0);

  rightGroup.position.set(0, planeHeight * 1, 0);
  rightGroup.rotation.set(Math.PI / 3, 0, Math.PI);
  rightPlane.rotation.set(0, Math.PI, 0);

  leftGroup.position.set(0, -planeHeight * 1, 0);
  leftGroup.rotation.set(-Math.PI / 3, 0, 0);
}

function setScreenPositions() {
  if (sizes.height > sizes.width) {
    positionBoxesForMobile();
  } else {
    positionBoxesForDesktop();
  }
}

setScreenPositions();

/**
 * Environment
 */
// const environmentSizeMultiplier = 2;
// const environmentGeometry = new THREE.BoxGeometry(
//   planeWidth * environmentSizeMultiplier,
//   planeWidth * environmentSizeMultiplier,
//   planeWidth * environmentSizeMultiplier
// );
// const environmentMaterial = new THREE.MeshPhysicalMaterial({
//   color: 0x00ff00,
//   side: THREE.BackSide,
// });
// const environment = new THREE.Mesh(environmentGeometry, environmentMaterial);
// environment.position.y = environment.position.y + planeWidth / 2;
// environment.receiveShadow = true;
// scene.add(environment);

const cloudname = "graycloud";
// scene.background = new THREE.CubeTextureLoader()
//   .setPath("textures/cloudy/")
//   .load([
//     `${cloudname}_lf.jpg`,
//     `${cloudname}_rt.jpg`,
//     `${cloudname}_up.jpg`,
//     `${cloudname}_dn.jpg`,
//     `${cloudname}_ft.jpg`,
//     `${cloudname}_bk.jpg`,
//   ]);
// scene.backgroundBlurriness = 0.05;
// scene.backgroundIntensity = 0.15;

const color = 0x200000; // white
scene.background = new THREE.Color(color);
// scene.backgroundIntensity = 0.005;

// scene.fog = new THREE.FogExp2(0xefd1b5, 0.05);

/**
 * Lighting
 */
const bulbLight = new THREE.PointLight(0xffee88, 0.25, 100, 0.2);

// const bulbMat = new THREE.MeshStandardMaterial({
//   emissive: 0xffffee,
//   emissiveIntensity: 1,
//   color: 0x000000,
// });
// bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
bulbLight.position.set(0, planeHeight, planeWidth);
bulbLight.castShadow = true;
bulbLight.shadow.radius = 10;
// scene.add(bulbLight);

const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 1.2);
// scene.add(hemiLight);

// let floorMat = new THREE.MeshStandardMaterial({
//   roughness: 0.8,
//   color: 0xffffff,
//   metalness: 0.2,
//   bumpScale: 0.0005,
// });
// const repeatValue = 20;
// const textureLoader = new THREE.TextureLoader();
// textureLoader.load(
//   "textures/concrete/Concrete_019_BaseColor.jpg",
//   function (map) {
//     map.wrapS = THREE.RepeatWrapping;
//     map.wrapT = THREE.RepeatWrapping;
//     // map.anisotropy = 4;
//     map.repeat.set(repeatValue, repeatValue);
//     // map.encoding = THREE.sRGBEncoding;
//     floorMat.map = map;
//     floorMat.needsUpdate = true;
//   }
// );
// textureLoader.load("textures/concrete/Concrete_019_Height.png", function (map) {
//   map.wrapS = THREE.RepeatWrapping;
//   map.wrapT = THREE.RepeatWrapping;
//   // map.anisotropy = 4;
//   map.repeat.set(repeatValue, repeatValue);
//   floorMat.bumpMap = map;
//   floorMat.needsUpdate = true;
// });
// textureLoader.load(
//   "textures/concrete/Concrete_019_Roughness.jpg",
//   function (map) {
//     map.wrapS = THREE.RepeatWrapping;
//     map.wrapT = THREE.RepeatWrapping;
//     // map.anisotropy = 4;
//     map.repeat.set(repeatValue, repeatValue);
//     floorMat.roughnessMap = map;
//     floorMat.needsUpdate = true;
//   }
// );
// const floorGeometry = new THREE.PlaneGeometry(1000, 1000);
// const floorMesh = new THREE.Mesh(floorGeometry, floorMat);
// floorMesh.receiveShadow = true;
// floorMesh.rotation.x = -Math.PI / 2.0;
// floorMesh.position.set(0, -planeHeight * 1.5, 0);
// scene.add(floorMesh);

/**
 * Interaction
 */
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  setScreenPositions();

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  if (intro.classList.contains("hide")) {
    fitCameraToSelection(
      camera,
      controls,
      [centralBox, rightBox, leftBox],
      1.5
    );
  }

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  40,
  sizes.width / sizes.height,
  0.1,
  100
);
// camera.position.x = 0;
// camera.position.y = 0;
camera.position.z = planeWidth * 0.25;
// camera.focalLength = 3;

scene.add(camera);

const near = camera.position.z * 2;
// const far = planeWidth * 7.5;
const far = planeWidth * 11;
scene.fog = new THREE.Fog(color, near, far);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
if (!threeDebug) {
  controls.enablePan = false;
  controls.enableRotate = false;
  // controls.minDistance = planeWidth * 0.1;
  // controls.maxDistance = planeWidth * 5;
} else {
  // content.remove();
  camera.position.z = planeWidth * 3;
}

/**
 * UI
 */
const content = document.getElementById("content");
const intro = document.getElementById("intro_container");
const details = document.getElementById("details_container");
const details_scroller = document.getElementById("details_content_outer");
function hideIntro() {
  intro.classList.add("hide");
  const distance = fitCameraToSelection(
    camera,
    controls,
    [centralBox, rightBox, leftBox],
    1.75,
    false
  );

  gsap.to(camera.position, {
    duration: 3,
    delay: 0,
    // y: -verticalShift,
    z: distance * 1,
    ease: "back.out(2)",
  });
}

function playVideos() {
  kissCrashVideo.currentTime = 0;
  slowKissVideo.currentTime = 0;

  kissCrashVideo.muted = false;
  kissCrashVideo.play();
}

function pauseVideos() {
  kissCrashVideo.pause();
  slowKissVideo.pause();
}

function resumeVideos() {
  kissCrashVideo.play();
  slowKissVideo.play();
}

/**
 * Buttons
 */
const enterButton = document.getElementById("enter_button");
enterButton.addEventListener("click", () => {
  // document.documentElement.requestFullscreen();
  hideIntro();
  playVideos();

  setTimeout(() => {
    content.style.zIndex = -1;
  }, 500);
});

// const showDetailsButton = document.getElementById("show_details_button");
const showDetailsButtons = document.getElementsByClassName("show_details");
Array.from(showDetailsButtons).forEach((btn) =>
  btn.addEventListener("click", () => {
    details_scroller.scrollTop = 0;
    content.style.zIndex = "inherit";

    // intro.classList.add("hide");
    // content.classList.remove("hide");
    details.classList.remove("hide");
    document.body.classList.add("details_visible");
    pauseVideos();
  })
);

const hideDetailsButton = document.getElementsByClassName("close_details");
Array.from(hideDetailsButton).forEach(function (element) {
  element.addEventListener("click", () => {
    details.classList.add("hide");
    document.body.classList.remove("details_visible");
    resumeVideos();

    if (intro.classList.contains("hide")) {
      setTimeout(() => {
        content.style.zIndex = -1;
      }, 500);
    }
  });
});

function enableEnter() {
  enterButton.disabled = false;
  enterButton.classList.remove("is_loading");
  console.log("enable enter");
}
function disableEnter() {
  enterButton.disabled = true;
  enterButton.classList.add("is_loading");
}
if (!hasKissCrashVideoLoaded || !hasSlowKissVideoLoaded) {
  disableEnter();
}

/**
 * Handle disabling videos for in person screenings
 */
function maybeDisableVideos() {
  const country = getCountry();

  // only block in Spain
  const isBlockedInCountry = country == "Spain";
  if (!isBlockedInCountry) return;

  // allow force show
  const urlParams = new URLSearchParams(window.location.search);
  const forceShow = urlParams.get("forceShow");
  if (forceShow) return;

  // only block for relevant dates
  const date = new Date();
  const month = date.getMonth();
  const monthDay = date.getDate();
  const year = date.getFullYear();
  if (year != 2023 || month != 5) return;
  if (monthDay < 14 || monthDay > 24) return;

  const disabledScreeningMessage = document.getElementById(
    "disabled-screening-message"
  );
  disabledScreeningMessage.classList.remove("hidden");
  enterButton.classList.add("hidden");

  const body = document.body.classList.add("hide_embeds");
}

maybeDisableVideos();
// hideDetailsButton;

for (let i = 0; i < 20; i++) {
  const geometry = new THREE.BoxGeometry(
    planeWidth * 2.5,
    planeWidth * 2.5,
    planeWidth * 2.5
  );
  const edgesGeometry = new THREE.EdgesGeometry(geometry);
  const material = new THREE.LineBasicMaterial({
    linewidth: 20,
    color: 0xdead70,
  });

  let edges = new THREE.LineSegments(edgesGeometry, material);
  edges.position.z = (i - 10) * planeWidth * (2.5 / 4) * -1;
  scene.add(edges);
}

// scene.add(object);
// scene.add(wireframe);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) / 500;
  mouseY = (event.clientY - windowHalfY) / 500;
}
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_effects_parallaxbarrier.html
document.addEventListener("mousemove", onDocumentMouseMove);
document.addEventListener("touchmove", (event) => {
  const touch = event.touches[0];
  if (!event || !event.touches) return;

  mouseX = (touch.clientX - windowHalfX) / 100;
  mouseY = (touch.clientY - windowHalfY) / 100;
});

new Splide(".splide", {
  type: "loop",
  width: "100%",
  // height: "400px",
  autoWidth: true,
  autoHeight: true,
  gap: "2vw",
  focus: "center",

  // padding: "20%",
}).mount();

/**
 * Animate
 */
const clock = new THREE.Clock();

// document.getElementById("webgl").style = "transform: rotate(90deg)";

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  if (!threeDebug) {
    camera.position.x += (mouseX - camera.position.x) * 0.025;
    camera.position.y += (-mouseY - camera.position.y) * 0.025;

    camera.lookAt(scene.position);
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

const urlParams = new URLSearchParams(window.location.search);
const shouldBeAnonymous = !!urlParams.get("is_anonymous");
if (shouldBeAnonymous) {
  document.body.classList.add("is_anonymous");
  document.title = "Kiss/Crash | AI Art Installation";
}

/**
 * Hidden Email Functionality
 */

let isEmailHidden = true;
const hiddenEmailLink = document.getElementById("hidden_email_link");
function revealHiddenEmail(e) {
  if (!isEmailHidden) return;

  e.preventDefault();
  hiddenEmailLink.innerText = "acole9@gmail.com";
  hiddenEmailLink.href = "mailto:acole9@gmail.com";
}

hiddenEmailLink.addEventListener("click", revealHiddenEmail);
