import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import gsap from "gsap";

// Texture Loader
const textureLoader = new THREE.TextureLoader();

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const geometry = new THREE.PlaneBufferGeometry(1, 1.3);

for (let i = 0; i < 4; i++) {
	const material = new THREE.MeshBasicMaterial({
		map: textureLoader.load(`/photographs/animal${i}.jpg`),
	});

	const img = new THREE.Mesh(geometry, material);
	img.position.set(Math.random(1.3), i * -1.8);

	scene.add(img);
}

let objs = [];

scene.traverse((object) => {
	console.log(object);
	if (object.isMesh) {
		objs.push(object);
	}
});

// Lights

const pointLight = new THREE.PointLight(0xffffff, 0.1);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

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
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2;
scene.add(camera);

gui.add(camera.position, "y").min(-5).max(10);

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Mouse
let y = 0;
let position = 0;

function onMouseWheel(event) {
	y = event.deltaY * 0.0007;
}

window.addEventListener("wheel", onMouseWheel);

const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (event) => {
	// ? Give mouse X value between -1 to 1;
	mouse.x = (event.clientX / sizes.width) * 2 - 1;
	mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

/**
 * Animate
 */

const raycaster = new THREE.Raycaster();

const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Update objects

	// ? Wheel control
	// ? position에 wheel 값을 계속 더해 현재의 좌표값을 return
	position -= y;
	camera.position.y = position;
	// ? stop: 60fps의 y 값이 점차 0에 수렴하게 만들어 움직이는 효과를 만듦
	y *= 0.9;

	// ? Raycaster
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(objs);
	for (const intersect of intersects) {
		gsap.to(intersect.object.scale, { x: 1.7, y: 1.7 });
		gsap.to(intersect.object.rotation, { y: -0.5 });
		gsap.to(intersect.object.position, { z: -0.9 });
		// intersect.object.scale.set(1.1, 1.1);
	}

	for (const object of objs) {
		// ? objs 안에 있는 각각의 mesh의 일부가 intersect에 탐지되지 않는 경우
		if (!intersects.find((intersect) => intersect.object === object)) {
			gsap.to(object.scale, { x: 1, y: 1 });
			gsap.to(object.rotation, { y: 0 });
			gsap.to(object.position, { z: 0 });
			// object.scale.set(1, 1);
		}
	}

	// Update Orbital Controls
	// controls.update()

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
