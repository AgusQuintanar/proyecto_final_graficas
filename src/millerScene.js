import * as THREE from "../libs/three.js/r131/three.module.js";

import { Water } from 'https://threejs.org/examples/jsm/objects/Water.js';
import { Sky } from 'https://threejs.org/examples/jsm/objects/Sky.js';

export class MillerScene {
    constructor(renderer) {

        const scene = buildScene();
        const camera = buildCamera();
        const sphere = buildSphere();
        const sky = buildSky();
        const sun = buildSun();
        const water = buildWater();

        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        this.sphere = sphere;
        this.sky = sky;
        this.water = water;
        this.sun = sun;

        function buildScene() {
            const scene = new THREE.Scene();
            return scene;
        }

        function buildCamera() {
            const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
            camera.position.set(30, 30, 100);
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

            sky.material.uniforms['sunPosition'].value.copy(sun);

            scene.environment = pmremGenerator.fromScene(sky).texture;
            return sun;
        }

        function buildWater() {
            const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
            const water = new Water(
                waterGeometry,
                {
                    textureWidth: 512,
                    textureHeight: 512,
                    waterNormals: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg', function (texture) {
                        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                    }),
                    alpha: 1.0,
                    sunDirection: new THREE.Vector3(),
                    sunColor: 0xffffff,
                    waterColor: 0x001e0f,
                    distortionScale: 3.7,
                    fog: scene.fog !== undefined
                }
            );
            water.rotation.x = -Math.PI / 2;
            scene.add(water);

            const waterUniforms = water.material.uniforms;
            return water;
        }

        function buildSphere() {
            const geometry = new THREE.SphereGeometry(20, 20, 20);
            const material = new THREE.MeshStandardMaterial({
                color: 0xfcc742
            });

            const sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);
            return sphere;
        }


        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener('resize', onWindowResize);
    }

    update () {
        // Animates water
        this.water.material.uniforms['time'].value += 1.0 / 60.0;

        const time = performance.now() * 0.001;
        this.sphere.position.y = Math.sin(time) * 2;
        this.sphere.rotation.x = time * 0.3;
        this.sphere.rotation.z = time * 0.3;
        this.renderer.render(this.scene, this.camera);
    };
        
}

