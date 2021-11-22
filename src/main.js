import * as THREE from "../libs/three.js/r131/three.module.js";
import { MTLLoader } from '../libs/three.js/r131/loaders/MTLLoader.js';
import { OBJLoader } from '../libs/three.js/r131/loaders/OBJLoader.js';
import { GLTFLoader } from '../libs/three.js/r131/loaders/GLTFLoader.js';
import { DRACOLoader } from '../libs/loaders/DRACOLoader.js';
import { FBXLoader } from '../libs/three.js/r131/loaders/FBXLoader.js';
import { MillerScene } from './millerScene.js';


import { RoughnessMipmapper } from '../libs/loaders/RoughnessMipmapper.js';


import { OrbitControls } from "../libs/three.js/r131/controls/OrbitControls.js";


let renderer = null,
	scene = null,
	mainScene = null,
	millerScene = null,
	camera = null,
	orbitControls = null,
	ambiente = null;

let duration = 100000000; // ms
let currentTime = Date.now();

let spotLight = null,
	ambientLight = null,
	directionalLight = null;

let SHADOW_MAP_WIDTH = 2048,
	SHADOW_MAP_HEIGHT = 2048;


function main() {
	const canvas = document.getElementById("webglcanvas");

	// create the scene
	createMainScene(canvas);
	// createMillerScene(canvas);
	millerScene = new MillerScene(canvas);

	console.log("siiuuuu", millerScene.scene);


	//scene = mainScene;
	scene = millerScene.scene;

	// update the update loop
	update();
}

function animate() {

    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

	millerScene.update();

}

function createAmbiente(scene) {
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

	animate();

	orbitControls.update();
}

async function createMainScene(canvas) {
	renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

	renderer.setSize(canvas.width, canvas.height);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	renderer.outputEncoding = THREE.sRGBEncoding;


	// creamos la escena
	mainScene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(
		45,
		canvas.width / canvas.height,
		1,
		4000
	);
	camera.position.set(0, 10, 40); // cambiamos la posicion de la camara
	mainScene.add(camera);

    // usamos los orbits controls para poder interactual con la escena de manera dinamica
	orbitControls = new OrbitControls(camera, renderer.domElement); 

	createAmbiente(mainScene);
	

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

	let waves = {obj:'../assets/waves/Ocean.obj', mtl:'../assets/waves/Ocean.obj.sxfil.mtl'};


	await loadGLTF("../assets/gargantua/source/bh.gltf", p1, 0.5);

	await loadGLTF("../assets/manns/mann.gltf", p2, 0.5, -Math.PI/2);

	await loadGLTF("../assets/spaceship2/scene.gltf", p3, 200);

	await loadFBX("../assets/astronaut/3d-model.fbx", p4, 0.1);

	await loadObjMtl(waves, p5, 200);

	await loadFBX("../assets/tars/OrangeBOT_FBX.fbx", p6, 0.25);

	mainScene.add(p1);
	mainScene.add(p2);
	mainScene.add(p3);
	mainScene.add(p4);
	mainScene.add(p5);
	mainScene.add(p6);

	const video = document.getElementById('video');
	video.play();

	//Create your video texture:
	const videoTexture = new THREE.VideoTexture(video);
	const videoMaterial =  new THREE.MeshBasicMaterial( {map: videoTexture, side: THREE.FrontSide, toneMapped: false} );
	//Create screen
	const screen = new THREE.PlaneGeometry(900, 600, 100, 100);
	const videoScreen = new THREE.Mesh(screen, videoMaterial);
	videoScreen.position.set(-1000, 800, 0);
	mainScene.add(videoScreen);

}

async function createMillerScene(canvas) {
	renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

	renderer.setSize(canvas.width, canvas.height);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	renderer.outputEncoding = THREE.sRGBEncoding;


	// creamos la escena
	millerScene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(
		45,
		canvas.width / canvas.height,
		1,
		4000
	);
	camera.position.set(0, 10, 40); // cambiamos la posicion de la camara
	millerScene.add(camera);

	     

    var ambientLight2 = new THREE.AmbientLight ( 0x444444, 0.8);
    millerScene.add(ambientLight2);

    // usamos los orbits controls para poder interactual con la escena de manera dinamica
	orbitControls = new OrbitControls(camera, renderer.domElement); 


	// Create a group to hold the objects
	var group = new THREE.Object3D;
	millerScene.add(group);

	// Create a texture map
	const map = new THREE.TextureLoader().load("../images/checker_large.gif");
	map.wrapS = map.wrapT = THREE.RepeatWrapping;
	map.repeat.set(8, 8);
	// Put in a ground plane to show off the lighting
	let geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
	let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({map:map, side:THREE.DoubleSide}));

	mesh.rotation.x = -Math.PI / 2;
	mesh.position.y = -4.02;
	mesh.castShadow = false;
	mesh.receiveShadow = true;
	group.add( mesh );

	createAmbiente(mainScene);
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


async function loadGLTF(url, parent, scale=1, rotateX=0) {
	const loader = new GLTFLoader();

	// const dracoLoader = new DRACOLoader();
	// dracoLoader.setDecoderPath( './decoder' );
	// loader.setDRACOLoader( dracoLoader );



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

async function loadObj(objModelUrl, parent)
{
    try
    {
        const object = await new OBJLoader().loadAsync(objModelUrl.obj, onProgress, onError);
        let texture = objModelUrl.hasOwnProperty('normalMap') ? new THREE.TextureLoader().load(objModelUrl.map) : null;
        let normalMap = objModelUrl.hasOwnProperty('normalMap') ? new THREE.TextureLoader().load(objModelUrl.normalMap) : null;
        let specularMap = objModelUrl.hasOwnProperty('specularMap') ? new THREE.TextureLoader().load(objModelUrl.specularMap) : null;

        console.log(object);
        
        object.traverse(function (child) 
        {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
                child.material.normalMap = normalMap;
                child.material.specularMap = specularMap;
            }
        });

        object.scale.set(20, 20, 20);

        object.name = "objObject";
        parent.add(object);

    }
    catch (err) 
    {
        onError(err);
    }
}

async function loadObjMtl(objModelUrl, parent, scale=1)
{
    try
    {
        const mtlLoader = new MTLLoader();

        const materials = await mtlLoader.loadAsync(objModelUrl.mtl, onProgress, onError);

        materials.preload();
        
        const objLoader = new OBJLoader();

        objLoader.setMaterials(materials);

        const object = await objLoader.loadAsync(objModelUrl.obj, onProgress, onError);
    
        object.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        object.scale.set(scale, scale, scale);

        parent.add(object);
    }
    catch (err)
    {
        onError(err);
    }
}

async function loadFBX(fbxModelUrl, parent, scale=1)
{
    try{
        let object = await new FBXLoader().loadAsync(fbxModelUrl);

		object.scale.set(scale, scale, scale);

        
        parent.add( object );
    }
    catch(err)
    {
        console.error( err );
    }
}