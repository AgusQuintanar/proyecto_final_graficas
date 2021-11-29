import * as THREE from "../libs/three.js/r131/three.module.js";
import { MillerScene } from './millerScene.js';

import { MainScene } from "./mainScene.js";


let renderer = null,
	currentScene = null;

let scenes = {
	mainScene: null,
	millerScene: null
}
	
async function main() {
	const canvas = document.getElementById("canvas");

	await createSceneManager(canvas);

	currentScene = scenes.millerScene;


	update();
}

async function createSceneManager(canvas) {
	renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

	renderer.setSize(canvas.width, canvas.height);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	renderer.outputEncoding = THREE.sRGBEncoding;

	scenes.mainScene = new MainScene(renderer);
	await scenes.mainScene.init();
	scenes.millerScene = new MillerScene(renderer);
}



function update() {
	requestAnimationFrame(function () {
		update();
	});

	currentScene.update();
}



function resize() {
    // En caso de que se haga un resize de la ventana del navegador,
    // se actualiza el aspecto de la camara
	const canvas = document.getElementById("canvas");

	canvas.width = document.body.clientWidth;
	canvas.height = document.body.clientHeight;

	renderer.setSize(canvas.width, canvas.height);
}

window.onload = () => {
	main();
	resize();
};

window.addEventListener("resize", resize, false);
