import * as THREE from "../libs/three.js/r131/three.module.js";

import { OrbitControls } from "../libs/three.js/r131/controls/OrbitControls.js";

import { loadFBX, loadGLTF, loadObj, loadObjMtl } from "./loaders.js";

export class MainScene {
	constructor(renderer) {
		const scene = buildScene();
		const camera = buildCamera();
		const orbitCon = setOrbitControls();

		this.scene = scene;
		this.renderer = renderer;
		this.camera = camera;
		this.orbitCon = orbitCon;

		this.duration = 100000000; // ms
		this.currentTime = Date.now();

		createAmbiente(this.scene);

		function buildScene() {
			const scene = new THREE.Scene();
			return scene;
		}

		function buildCamera() {
			const camera = new THREE.PerspectiveCamera(
				45,
				canvas.width / canvas.height,
				1,
				4000
			);
			camera.position.set(0, 10, 40); // cambiamos la posicion de la camara
			return camera;
		}

		function createAmbiente(scene) {
			// crea un ambiente y le agrega distintos tipos de luces y un piso, al grafo de la escena
			let ambiente = new THREE.Object3D();

			let spotLight = new THREE.SpotLight(0xffffff, 1);

			let SHADOW_MAP_WIDTH = 2048,
				SHADOW_MAP_HEIGHT = 2048;

			spotLight.position.set(-10000, 8, -10);
			spotLight.target.position.set(0, 0, 0);
			ambiente.add(spotLight);

			spotLight.castShadow = true;
			spotLight.shadow.camera.near = 1;
			spotLight.shadow.camera.far = 20000;
			spotLight.shadow.camera.fov = 180;

			spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
			spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

			let ambientLight = new THREE.AmbientLight(0xffffff, 1);
			ambiente.add(ambientLight);

			scene.add(ambiente);
		}

		function setOrbitControls() {
			const controls = new OrbitControls(camera, renderer.domElement);
			controls.maxPolarAngle = Math.PI * 0.495;
			controls.target.set(0, 10, 0);
			controls.minDistance = 40.0;
			controls.maxDistance = 200.0;
			controls.update();
			return controls;
		}

		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		}
		window.addEventListener("resize", onWindowResize);
	}


    async init () {
        await this.loadObjects();
    }

	async loadObjects() {
        console.log("Loading objects...");
		const p1 = new THREE.Object3D();
		const p2 = new THREE.Object3D();
		p2.position.set(-2000, 0, 0);
		const p3 = new THREE.Object3D();
		p3.position.set(-1000, 0, 0);
		const p4 = new THREE.Object3D();
		p4.position.set(-750, 0, 0);
		const p5 = new THREE.Object3D();
		p5.position.set(-1000, 0, 100);
		const p6 = new THREE.Object3D();
		p6.position.set(-750, 400, 0);

		let waves = {
			obj: "../assets/waves/Ocean.obj",
			mtl: "../assets/waves/Ocean.obj.sxfil.mtl",
		};

		await loadGLTF("../assets/gargantua/source/bh.gltf", p1, 0.5);

		await loadGLTF("../assets/manns/mann.gltf", p2, 0.5, -Math.PI / 2);

		await loadGLTF("../assets/spaceship2/scene.gltf", p3, 200);

		await loadFBX("../assets/astronaut/3d-model.fbx", p4, 0.1);

		await loadObjMtl(waves, p5, 200);

		await loadFBX("../assets/tars/OrangeBOT_FBX.fbx", p6, 0.25);

		this.scene.add(p1);
		this.scene.add(p2);
		this.scene.add(p3);
		this.scene.add(p4);
		this.scene.add(p5);
		this.scene.add(p6);

		const video = document.getElementById("video");
		video.play();

		//Create your video texture:
		const videoTexture = new THREE.VideoTexture(video);
		const videoMaterial = new THREE.MeshBasicMaterial({
			map: videoTexture,
			side: THREE.FrontSide,
			toneMapped: false,
		});
		//Create screen
		const screen = new THREE.PlaneGeometry(900, 600, 100, 100);
		const videoScreen = new THREE.Mesh(screen, videoMaterial);
		videoScreen.position.set(-1000, 800, 0);
		this.scene.add(videoScreen);
	}

	animate() {
		let now = Date.now();
		let deltat = now - this.currentTime;
		this.currentTime = now;
		let fract = deltat / this.duration;
		let angle = Math.PI * 2 * fract;
	}

	update() {
		this.animate();
		this.renderer.render(this.scene, this.camera);
	}
}
