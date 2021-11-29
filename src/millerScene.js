import * as THREE from "../libs/three.js/r131/three.module.js";

import { Water } from "https://threejs.org/examples/jsm/objects/Water.js";
import { Sky } from "https://threejs.org/examples/jsm/objects/Sky.js";
import { FirstPersonControls } from "https://threejs.org/examples/jsm/controls/FirstPersonControls.js";
import { loadGLTF } from "./loaders.js";

export class MillerScene {
	constructor(renderer) {
		const scene = buildScene();
		const camera = buildCamera();
		const sky = buildSky();
		const sun = buildSun();
		const water = buildWater();
		const fpc = buildFirstPersonControls(camera, renderer);
        const maletin = buildMaletin(scene);
        const nave = buildNave(scene);
        const estacion = buildEstacion(scene);

		this.scene = scene;
		this.renderer = renderer;
		this.camera = camera;
		this.sky = sky;
		this.water = water;
		this.sun = sun;
		this.fpc = fpc;
		this.maletin = maletin;
        this.nave = nave;
        this.estacion = estacion;
		this.raycaster = new THREE.Raycaster(
			new THREE.Vector3(),
			new THREE.Vector3(0, -1, 0),
			0,
			15
		);
		this.maletinEncontrado = false;
        this.startTime = Date.now();

		function buildScene() {
			const scene = new THREE.Scene();
			return scene;
		}

		function buildCamera() {
			const camera = new THREE.PerspectiveCamera(
				55,
				window.innerWidth / window.innerHeight,
				1,
				20000
			);
			camera.position.set(70, 40, 100);
			return camera;
		}

		// Objects
		function buildSky() {
			const sky = new Sky();
			sky.scale.setScalar(10000);
			scene.add(sky);
			return sky;
		}

		function buildSun() {
			const pmremGenerator = new THREE.PMREMGenerator(renderer);

			const sun = new THREE.Vector3();

			const theta = Math.PI * (0.49 - 0.5);
			const phi = 2 * Math.PI * (0.205 - 0.5);

			sun.x = Math.cos(phi);
			sun.y = Math.sin(phi) * Math.sin(theta);
			sun.z = Math.sin(phi) * Math.cos(theta);

			sky.material.uniforms["sunPosition"].value.copy(sun);

			scene.environment = pmremGenerator.fromScene(sky).texture;
			return sun;
		}

		function buildWater() {
			const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
			const water = new Water(waterGeometry, {
				textureWidth: 512,
				textureHeight: 512,
				waterNormals: new THREE.TextureLoader().load(
					"https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg",
					function (texture) {
						texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
					}
				),
				alpha: 1.0,
				sunDirection: new THREE.Vector3(),
				sunColor: 0xffffff,
				waterColor: 0x001e0f,
				distortionScale: 3.7,
				fog: scene.fog !== undefined,
			});
			water.rotation.x = -Math.PI / 2;
			scene.add(water);

			const waterUniforms = water.material.uniforms;
			return water;
		}

		function buildFirstPersonControls(camera, renderer) {
			const fpc = new FirstPersonControls(camera, renderer.domElement);
			fpc.movementSpeed = 1;
			fpc.lookSpeed = 0.001;
			fpc.lookVertical = false;
			return fpc;
		}

		function buildEstacion(scene) {
			const estacion = new THREE.Object3D();
            estacion.visible = false;
            scene.add(estacion);
            estacion.position.y -= 10;
			return estacion;
		}

		function buildMaletin(scene) {
			const maletin = new THREE.Object3D();
			scene.add(maletin);
			maletin.position.set(250, 250, 0);
			return maletin;
		}

		function buildNave(scene) {
			const nave = new THREE.Object3D();
			scene.add(nave);
			nave.position.y = 300;
			return nave;
		}

		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		}
		window.addEventListener("resize", onWindowResize);
	}

	async init() {
		await this.loadObjects();
	}

	async loadObjects() {
		await loadGLTF("../assets/maletin/scene.gltf", this.maletin, 40);

		await loadGLTF("../assets/spaceship2/scene.gltf", this.nave, 300);

        await loadGLTF("../assets/spaceship2/scene.gltf", this.estacion, 300);
	}

    getTiempoRestante() {
        const tiempoRestante = (this.startTime + (15 * 1000)) - Date.now();
        return Math.round(tiempoRestante / 1000);
    }

    resetScene() {
        this.camera.position.set(70, 40, 100);
        this.maletin.visible = true;
        this.maletinEncontrado = false;
        this.startTime = Date.now();
    }

	update() {
        if (this.getTiempoRestante() <= 0) {
            this.resetScene();
        }

		// Animates water
		this.water.material.uniforms["time"].value += 1.0 / 60.0;

		const time = performance.now() * 0.001;

		this.maletin.position.y = Math.sin(time) * 2 - 2;
		this.nave.position.y = Math.sin(time) * 4.5 - 5 + 40;

		this.fpc.update(time / 100);

		this.raycaster.ray.origin.copy(this.camera.position);
		this.raycaster.ray.origin.y -= 10;

		if (!this.maletinEncontrado) {
			const intersects = this.raycaster.intersectObject(
				this.maletin,
				true
			);
			if (intersects.length > 0) {
				this.maletinEncontrado = true;
				this.maletin.visible = false;
                this.
                console.log("Maletin encontrado");
			}
		} 
        else {
            let intersectaEstacion = this.raycaster.intersectObjects(
                [this.estacion],
                true
            ).length > 0;
            if (intersectaEstacion) {
                // finaliza el juego
            }
        }

        console.log(this.getTiempoRestante());

		this.renderer.render(this.scene, this.camera);
	}
}
