import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import * as dat from "lil-gui";
import { ParallaxBarrierEffect } from "three/addons/effects/ParallaxBarrierEffect.js";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

let effect;

/**
 * Video Textures
 */
const kissCrashVideo = document.getElementById("kiss_crash_video");
kissCrashVideo.play();
kissCrashVideo.addEventListener("play", function () {
  this.currentTime = 3;
});
const slowKissVideo = document.getElementById("slow_kiss_video");
slowKissVideo.play();
slowKissVideo.addEventListener("play", function () {
  this.currentTime = 3;
});

const planeWidth = 25;
const planeHeight = planeWidth * (9 / 16);
const boxThickness = 0.5;

const kissCrashVideoTexture = new THREE.VideoTexture(kissCrashVideo);
const slowKKissVideoTexture = new THREE.VideoTexture(slowKissVideo);

/**
 * Video Meshes
 */
// CENTRAL PLANE
const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
const kissCrashMaterial = new THREE.MeshBasicMaterial({
  //   color: 0xffffff,
  side: THREE.DoubleSide,
  map: kissCrashVideoTexture,
});
const slowKissMaterial = new THREE.MeshBasicMaterial({
  //   color: 0xffffff,
  side: THREE.DoubleSide,
  map: slowKKissVideoTexture,
});
const centralPlane = new THREE.Mesh(planeGeometry, kissCrashMaterial);
scene.add(centralPlane);

// ADJACENT PLANES
const horizontalShift = planeWidth * (3 / 4);
const depthShift = planeWidth / 2;

const rightPlane = new THREE.Mesh(planeGeometry, slowKissMaterial);
rightPlane.rotation.y = -Math.PI / 2;
rightPlane.position.set(horizontalShift, 0, depthShift);
scene.add(rightPlane);

const leftPlane = new THREE.Mesh(planeGeometry, slowKissMaterial);
leftPlane.rotation.y = -Math.PI / 2;
leftPlane.position.set(-horizontalShift, 0, depthShift);
scene.add(leftPlane);

// BOXES
const boxShift = 0.01;
const boxGeometry = new THREE.BoxGeometry(
  planeWidth,
  planeHeight,
  boxThickness
);
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const centralBox = new THREE.Mesh(boxGeometry, boxMaterial);
centralBox.position.set(
  centralPlane.position.x,
  centralPlane.position.y,
  centralPlane.position.z - boxThickness / 2 - boxShift
);

const rightBox = new THREE.Mesh(boxGeometry, boxMaterial);
rightBox.position.set(
  rightPlane.position.x + boxThickness / 2 + boxShift,
  rightPlane.position.y,
  rightPlane.position.z
);
rightBox.rotation.set(...rightPlane.rotation);

const leftBox = new THREE.Mesh(boxGeometry, boxMaterial);
leftBox.position.set(
  leftPlane.position.x - boxThickness / 2 - boxShift,
  leftPlane.position.y,
  leftPlane.position.z
);
leftBox.rotation.set(...leftPlane.rotation);

// const
scene.add(centralBox);
scene.add(rightBox);
scene.add(leftBox);

/**
 * Environment
 */

/**
 * Interaction
 */
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  effect.setSize(window.innerWidth, window.innerHeight);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  60,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = planeWidth;
camera.focalLength = 3;

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableRotate = false;
controls.minDistance = 10;
controls.maxDistance = 60;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) / 50;
  mouseY = (event.clientY - windowHalfY) / 50;
}
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_effects_parallaxbarrier.html
document.addEventListener("mousemove", onDocumentMouseMove);

effect = new ParallaxBarrierEffect(renderer);
effect.setSize(sizes.width, sizes.height);

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  camera.position.x += (mouseX - camera.position.x) * 0.025;
  camera.position.y += (-mouseY - camera.position.y) * 0.025;

  camera.lookAt(scene.position);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
