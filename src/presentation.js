import * as THREE from "../libs/three.js/r131/three.module.js";
import { MTLLoader } from '../libs/three.js/r131/loaders/MTLLoader.js';
import { OBJLoader } from '../libs/three.js/r131/loaders/OBJLoader.js';
import { GLTFLoader } from '../libs/three.js/r131/loaders/GLTFLoader.js';
import { DRACOLoader } from '../libs/loaders/DRACOLoader.js';
import { FBXLoader } from '../libs/three.js/r131/loaders/FBXLoader.js';


import { RoughnessMipmapper } from '../libs/loaders/RoughnessMipmapper.js';


import { OrbitControls } from "../libs/three.js/r131/controls/OrbitControls.js";


let renderer = null,
	scene = null,
	camera = null,
	orbitControls = null,
	ambiente = null;

let duration = 100000000; // ms
let currentTime = Date.now();

let spotLight = null,
	ambientLight = null;

let SHADOW_MAP_WIDTH = 2048,
	SHADOW_MAP_HEIGHT = 2048;

let textureMap = null;
let bumpMap = null;
let materials = {};

const miller = new THREE.Object3D();
const edmons = new THREE.Object3D();


let names = ["miller", "edmons"];
let namesTextures = ["miller-textured", "edmons-textured"];

const infoDisplay = document.querySelector('#info');
const continueButton = document.querySelector('#start');


function main() {

	const canvas = document.getElementById("webglcanvas");
    continueButton.addEventListener('click', playText);


	// create the scene
	createScene(canvas);

	// update the update loop
	update();
}


function playText(){
    continueButton.remove();
    let text= [ 
        "En 2067, la destrucción de las cosechas en la Tierra ha hecho que la agricultura sea cada vez más difícil y se vea amenazada la supervivencia de la humanidad",
        "Joseph Cooper, ex piloto de la NASA ha sido reclutado nuevamente para emprender una misión Interestelar para encontrar un planeta fuera de nuestra galaxia que pueda albergar vida humana",
        "Conociendo los peligros de la misión, Cooper decide dejar en la Tierra aquellos que él ama, en especial la pequeña Murph de tan solo 13 años",
        "La misión conformada por los astronautas Romilly, Doyle y Amelia podria tomar decadas, pues tendrian que evaluar los planetas cercanos al agujero negro Gargantúa"];

    setTimeout(function(){
        infoDisplay.innerHTML = text[0];
    }, 1000);

    setTimeout(function(){
        infoDisplay.innerHTML = text[1];
    }, 9000);

    setTimeout(function(){
        infoDisplay.innerHTML = text[2];
    }, 20000);

    setTimeout(function(){
        infoDisplay.innerHTML = text[3];
    }, 30000);

    setTimeout(function(){
        infoDisplay.innerHTML = "";
    }, 40000);

    
}

function animate() {

    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;


    let fract2 = deltat / 10000;
    let angle2 = Math.PI * 2 * fract2;

    // Rotate the sphere group about its Y axis
    miller.rotation.y += angle2;
    edmons.rotation.y += angle2;

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

	animate();

	orbitControls.update();
}

function createMaterials(mapUrl, bumpMapUrl, nombre, nombreTexture)
{
    // Create a textre phong material for the cube
    // First, create the texture map
    textureMap = new THREE.TextureLoader().load(mapUrl);
    bumpMap = new THREE.TextureLoader().load(bumpMapUrl);

    materials[nombre] = new THREE.MeshPhongMaterial({ bumpMap: bumpMap, bumpScale: 0.01});
    materials[nombreTexture] = new THREE.MeshPhongMaterial({ map: textureMap, bumpMap: bumpMap, bumpScale: 0.01 });
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
	camera.position.set(0, 10, 40); // cambiamos la posicion de la camara
	scene.add(camera);

    // usamos los orbits controls para poder interactual con la escena de manera dinamica
	orbitControls = new OrbitControls(camera, renderer.domElement); 

	createAmbiente();
	

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


    
    miller.position.set(-30,0,0);

    edmons.position.set(20,0,0);

    const millerMapUrl = "../images/millermap.jpg",      millerBumpMapUrl = "../images/millermap.jpg";
    const edmonsMapUrl = "../images/edmonsmap.jpg",      edmonsBumpMapUrl = "../images/edmonsbump.jpg";

    let urlMapsNames = [millerMapUrl, edmonsMapUrl]; 

    let urlBumpsNames =[millerBumpMapUrl, edmonsBumpMapUrl];

    let elements = {}
    let elementsTextured = {}

    //Create Material
    for (let i = 0; i < 2; i++){
        createMaterials(urlMapsNames[i], urlBumpsNames[i], names[i], namesTextures[i]);
    }
    
    // Create mesh
    let geometry = new THREE.SphereGeometry(2, 50, 50);

    for (let i = 0; i < 2; i++){
        elements[i] = new THREE.Mesh(geometry, materials[names[i]]);
        elements[i].visible = false;
    }

    geometry = new THREE.SphereGeometry(2, 50, 50);
    for (let i = 0; i < 2; i++){
        elementsTextured[i] = new THREE.Mesh(geometry, materials[namesTextures[i]]);
        elementsTextured[i].visible = true;
    }

     
    miller.add(elements[0]);
    miller.add(elementsTextured[0]);
    edmons.add(elements[1]);
    edmons.add(elementsTextured[1]);


	let waves = {obj:'../assets/waves/Ocean.obj', mtl:'../assets/waves/Ocean.obj.sxfil.mtl'};

	await loadGLTF("../assets/gargantua/source/bh.gltf", p1, 0.5);

	await loadGLTF("../assets/manns/mann.gltf", p2, 0.5, -Math.PI/2);

	//await loadGLTF("../assets/spaceship2/scene.gltf", p3, 200);

	//await loadFBX("../assets/astronaut/3d-model.fbx", p4, 0.1);

	await loadObjMtl(waves, p5, 200);

	await loadFBX("../assets/tars/OrangeBOT_FBX.fbx", p6, 0.25);

	scene.add(p1);
    scene.add(miller);
    scene.add(edmons);
	//scene.add(p2);
	//scene.add(p3);
	//scene.add(p4);
	//scene.add(p5);
	//scene.add(p6);

	const video = document.getElementById('video');
	video.play();

    var music = document.getElementById("audio");
    music.play();

	//Create your video texture:
	const videoTexture = new THREE.VideoTexture(video);
	const videoMaterial =  new THREE.MeshBasicMaterial( {map: videoTexture, side: THREE.FrontSide, toneMapped: false} );
	//Create screen
	const screen = new THREE.PlaneGeometry(900, 600, 100, 100);
	const videoScreen = new THREE.Mesh(screen, videoMaterial);
	videoScreen.position.set(-1000, 800, 0);
	scene.add(videoScreen);

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