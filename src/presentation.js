import * as THREE from "../libs/three.js/r131/three.module.js";
import { MTLLoader } from '../libs/three.js/r131/loaders/MTLLoader.js';
import { OBJLoader } from '../libs/three.js/r131/loaders/OBJLoader.js';
import { GLTFLoader } from '../libs/three.js/r131/loaders/GLTFLoader.js';
import { DRACOLoader } from '../libs/loaders/DRACOLoader.js';
import { FBXLoader } from '../libs/three.js/r131/loaders/FBXLoader.js';


import { RoughnessMipmapper } from '../libs/loaders/RoughnessMipmapper.js';


import { OrbitControls } from "../libs/three.js/r131/controls/OrbitControls.js";


let p6 = null;

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

let tam = [2, 0.6, 1];

const miller = new THREE.Object3D();
const edmons = new THREE.Object3D();
const manns = new THREE.Object3D();


let raycaster = null, mouse = new THREE.Vector2(), intersected, clicked;


let names = ["miller", "edmons", "manns"];
let namesTextures = ["miller-textured", "edmons-textured", "manns-textured"];

const infoDisplay = document.querySelector('#info');
const tarsDisplay = document.querySelector('#tars');
const continueButton = document.querySelector('#start');
const millerText = document.querySelector('.cuadroTextMiller');
const mannsText = document.querySelector('.cuadroTextManns');
const edmonsText = document.querySelector('.cuadroTextEdmons');
const infoScenes = document.querySelector('#scenes');


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

    let textTars = [ "Soy TARS, un robot con inteligencia artificial que te acompañará en esta aventura interestelar. ",
                    "Han pasado 2 años desde el despegue de Cooper de la Tierra, han atravesado el agujero de gusano de Saturno y ahora se encuentran en la Galaxia lejana que contiene a Gargantúa. ",
                    "En la parte superior derecha podrás ver información que ayudará a entender la relatividad del tiempo en esta experiencia Interstellar.",
                    "Actualmente Cooper tiene 35 años, Murph 15 años y nos encontramos en el año 2069.",
                    "Te toca elegir qué experiencia vivir. Da clic en alguno de los planetas y descubre que sucederá."];

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

    setTimeout(function(){   
        tarsDisplay.innerHTML = textTars[0];
    }, 50000);

    setTimeout(function(){
        tarsDisplay.innerHTML = textTars[1];
    }, 60000);

    setTimeout(function(){
        tarsDisplay.innerHTML = textTars[2];
        actualizaInfo(35,15,2069);
    }, 70000);

    setTimeout(function(){
        tarsDisplay.innerHTML = textTars[3]; 
    }, 80000);

    setTimeout(function(){
        tarsDisplay.innerHTML = textTars[4];
    }, 90000);

    

    
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
    manns.rotation.y += angle2;


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
	camera.position.set(20, 10, 80); // cambiamos la posicion de la camara
    //camera.position.set(0, 0, 0); // cambiamos la posicion de la camara
	scene.add(camera.position);

    // usamos los orbits controls para poder interactual con la escena de manera dinamica
	orbitControls = new OrbitControls(camera, renderer.domElement); 
    console.log(camera)

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
	p6 = new THREE.Object3D();
	//p6.position.set(30, 10, 0);
    //camera.position.set(20, 10, 80);

    p6.position.set(40, -8, 28);
    p6.rotateY(Math.PI / 25);

    p6.scale.x = 0.08;
    p6.scale.y = 0.08;
    p6.scale.z = 0.08;


    
   // miller.position.set(-60,20,0);

    //edmons.position.set(15,0,15);

    miller.position.set(-10,0,0);

    edmons.position.set(20,0,15);

    manns.position.set(-80,15,-10);

    //miller.position.set(0,0,-30);

    //edmons.position.set(30,0,-30);


    const millerMapUrl = "../images/millermap.jpg",      millerBumpMapUrl = "../images/millermap.jpg";
    const edmonsMapUrl = "../images/edmonsmap.jpg",      edmonsBumpMapUrl = "../images/edmonsbump.jpg";
    const mannsMapUrl = "../images/mannsmap.jpg",        mannsBumpMapUrl = "../images/mannsbump.jpg";

    let urlMapsNames = [millerMapUrl, edmonsMapUrl, mannsMapUrl]; 

    let urlBumpsNames =[millerBumpMapUrl, edmonsBumpMapUrl, mannsBumpMapUrl];

    let elements = {}
    let elementsTextured = {}

    //Create Material
    for (let i = 0; i < 3; i++){
        createMaterials(urlMapsNames[i], urlBumpsNames[i], names[i], namesTextures[i]);
    }
    
    // Create mesh
    let geometry = new THREE.SphereGeometry(2, 50, 50);

    for (let i = 0; i < 3; i++){
        elements[i] = new THREE.Mesh(geometry, materials[names[i]]);
        elements[i].visible = false;
    }

    geometry = new THREE.SphereGeometry(2, 50, 50);
    for (let i = 0; i < 3; i++){
        elementsTextured[i] = new THREE.Mesh(geometry, materials[namesTextures[i]]);
        elementsTextured[i].visible = true;
        elementsTextured[i].scale.x = tam[i];
        elementsTextured[i].scale.y = tam[i];
        elementsTextured[i].scale.z = tam[i];
    }

     
    miller.add(elements[0]);
    miller.add(elementsTextured[0]);
    edmons.add(elements[1]);
    edmons.add(elementsTextured[1]);
    manns.add(elements[2]);
    manns.add(elementsTextured[2]);

    miller.name  = "Miller"
    edmons.name = "Edmons"
    manns.name = "Manns"

	let waves = {obj:'../assets/waves/Ocean.obj', mtl:'../assets/waves/Ocean.obj.sxfil.mtl'};

	await loadGLTF("../assets/gargantua/source/bh.gltf", p1, 0.5);

	await loadGLTF("../assets/manns/mann.gltf", p2, 0.5, -Math.PI/2);

	//await loadGLTF("../assets/spaceship2/scene.gltf", p3, 200);

	//await loadFBX("../assets/astronaut/3d-model.fbx", p4, 0.1);

	await loadObjMtl(waves, p5, 200);

	await loadFBX("../assets/tars/OrangeBOT_FBX.fbx", p6, 0.25);

	
    //scene.add(p1);
    
    scene.add(miller);
    scene.add(edmons);
    scene.add(manns);



  

	//scene.add(p2);
	//scene.add(p3);
	//scene.add(p4);
	//scene.add(p5);
    
	scene.add(p6);

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

    //Raycaster
    raycaster = new THREE.Raycaster();

    document.addEventListener('pointerdown', onDocumentPointerDownMiller);
	scene.add(videoScreen);

}

function onDocumentPointerDownMiller(event)
{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    let intersects = null;
    intersects = raycaster.intersectObjects( miller.children );

    let cual = "Miller"
    if (intersects.length == 0){
        
        intersects = raycaster.intersectObjects( manns.children );
        cual = "Manns"
        if (intersects.length == 0){
            intersects = raycaster.intersectObjects( edmons.children );
            cual = "Edmons"
        }
    }
    
    if ( intersects.length > 0 ) 
    {
        if (cual == "Miller"){
            console.log("miller")
            clicked = intersects[ 0 ].object;
            camera.position.set(-22,1,6.4);
            p6.visible = false;
            millerText.style.display = 'block';

        } 
        else if (cual == "Edmons"){
            console.log("edmons")
            clicked = intersects[ 0 ].object;
            camera.position.set(25.63,-0.2074,17.785);
            p6.visible = false;
            edmonsText.style.display = 'block';
        }
        else if (cual=="Manns"){
            console.log("manns")
            clicked = intersects[ 0 ].object;
            camera.position.set(-89.52,16.79,-9.7945);
            p6.visible = false;
            mannsText.style.display = 'block';
        }
    } 
    else 
    {
        if ( clicked ) 
            camera.position.set(20, 10, 80);
            p6.visible = true;
            millerText.style.display = 'none';
            mannsText.style.display = 'none';
            edmonsText.style.display = 'none';
        clicked = null;
    }
}



function actualizaInfo(edadCopper, edadMurph, anio){
    let texto = "Edad de Cooper: " + edadCopper.toString() + '\n' + "Edad de Murph: " + edadMurph.toString() + '\n' + "Año: " + anio.toString();
    console.log(texto);
    let finalText = texto.toString();

    infoScenes.innerHTML = finalText;
    //infoScenes.innerHTML = 'Edad de Cooper: ' + edadCopper + '\n Edad de Murph: ' + edadMurph + '\n Año: ' + anio;

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