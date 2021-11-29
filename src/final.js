import * as THREE from "../libs/three.js/r131/three.module.js";
import { GLTFLoader } from '../libs/three.js/r131/loaders/GLTFLoader.js';

let p5 = null;

let stars = [];

let renderer = null,
	scene = null,
	camera = null,
	ambiente = null;

let currentTime = Date.now();

let spotLight = null,
	ambientLight = null;

let SHADOW_MAP_WIDTH = 2048,
	SHADOW_MAP_HEIGHT = 2048;

const graciasText = document.querySelector('.cuadroFinal');

function main() {

	const canvas = document.getElementById("webglcanvas");
    graciasText.style.display = 'block';
	// create the scene
	createScene(canvas);
	// update the update loop
	update();
}

function animate() {

    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / 100000;
    let angle = Math.PI * 2 * fract;
    p5.rotation.y += angle;
}

function createAmbiente() {
	// crea un ambiente y le agrega distintos tipos de luces y un piso, al grafo de la escena
	ambiente = new THREE.Object3D();
	spotLight = new THREE.SpotLight(0xffffff, 1);
	spotLight.position.set(-10000, 8, -10);
	spotLight.target.position.set(0, 0, 0);
	ambiente.add(spotLight);

	spotLight.castShadow = true;
	spotLight.shadow.camera.near = 1;
	spotLight.shadow.camera.far = 20000;
	spotLight.shadow.camera.fov = 180;

	spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
	spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

	ambientLight = new THREE.AmbientLight(0xffffff, 1);
	ambiente.add(ambientLight);
	scene.add(ambiente);
}

function update() {
	requestAnimationFrame(function () {
		update();
	});

	renderer.render(scene, camera);
    //console.log(camera.position)
    animate();
}

async function createScene(canvas) {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
	renderer.setSize(canvas.width, canvas.height);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.outputEncoding = THREE.sRGBEncoding;

	// creamos la escena
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(
		45,
		canvas.width / canvas.height,
		1,
		4000
	);
	//camera.position.set(20, 10, 80); // cambiamos la posicion de la camara
    camera.position.set(56.22, 5.038, 111.759); // cambiamos la posicion de la camara
	scene.add(camera.position);
    console.log(camera)

    //Añade estrellas
    addSphere();

    //Música a la escena
     var music = document.getElementById("audio");
     music.play();

    //Añade luces
	createAmbiente();

    p5 = new THREE.Object3D();
	p5.position.set(200, -15, -400);

    await loadGLTF("../assets/Earth/Earth_1_12756.glb", p5, 0.5);
    scene.add(p5);
}

function addSphere(){

    // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position. 
    for ( var z= -1000; z < 1000; z+=20 ) {

        // Make a sphere (exactly the same as before). 
        var geometry = new THREE.SphereGeometry(0.5, 32, 32)
        var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
        var sphere   = new THREE.Mesh(geometry, material)

        // This time we give the sphere random x and y positions between -500 and 500
        sphere.position.x = Math.random() * 1000 - 500;
        sphere.position.y = Math.random() * 1000 - 500;

        // Then set the z position to where it is in the loop (distance of camera)
        sphere.position.z = z;

        // scale it up a bit
        sphere.scale.x = sphere.scale.y = 2;

        //add the sphere to the scene
        scene.add( sphere );

        //finally push it to the stars array 
        stars.push(sphere); 
    }
}

async function loadGLTF(url, parent, scale, rotateX=0) {
	const loader = new GLTFLoader();

	const object = await loader.loadAsync(
		// resource URL
		url,
		// called while loading is progressing
		onProgress,
		// called when loading has errors
		onError
	);
	
	object.scene.scale.set(scale, scale, scale);

	object.scene.rotateX(rotateX);

	console.log(object.scene);

	parent.add(object.scene);
}



function resize() {
    // En caso de que se haga un resize de la ventana del navegador,
    // se actualiza el aspecto de la camara
	const canvas = document.getElementById("webglcanvas");

	canvas.width = document.body.clientWidth;
	canvas.height = document.body.clientHeight;

	camera.aspect = canvas.width / canvas.height;

	camera.updateProjectionMatrix();
	renderer.setSize(canvas.width, canvas.height);
}

window.onload = () => {
	main();
	resize();
};

window.addEventListener("resize", resize, false);

function onError ( err ){ console.error( err ); };

function onProgress( xhr ) 
{
    if ( xhr.lengthComputable ) {

        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( xhr.target.responseURL, Math.round( percentComplete, 2 ) + '% downloaded' );
    }
}

