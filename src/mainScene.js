import * as THREE from "../libs/three.js/r131/three.module.js";
import { FBXLoader } from "../libs/three.js/r131/loaders/FBXLoader.js";
import { OrbitControls } from "../libs/three.js/r131/controls/OrbitControls.js";

let tars_robot = null;

let stars = [];

let renderer = null,
	scene = null,
	camera = null,
	orbitControls = null,
	ambiente = null;

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

let videoScreen = null;

let raycaster = null,
	mouse = new THREE.Vector2(),
	intersected,
	clicked;

let names = ["miller", "edmons", "manns"];
let namesTextures = ["miller-textured", "edmons-textured", "manns-textured"];

const infoDisplay = document.querySelector("#info");
const tarsDisplay = document.querySelector("#tars");
const continueButton = document.querySelector("#start");
const millerText = document.querySelector(".cuadroTextMiller");
const mannsText = document.querySelector(".cuadroTextManns");
const edmonsText = document.querySelector(".cuadroTextEdmons");
const infoScenes = document.querySelector("#scenes");

const canvas = document.getElementById("webglcanvas");

const btnMisionMiller = document.querySelector("#misionMiller");

export class MainScene {
	constructor(render, moveToMillerScene, getMillerGameCompleted, firstTime) {
		renderer = render;

		if (firstTime) {
			continueButton.addEventListener("click", playText);
		} else {
			infoDisplay.style.display = "none";
			continueButton.style.display = "none";
		}

		console.log("mision completada", getMillerGameCompleted());
		if (getMillerGameCompleted()) {
			btnMisionMiller.innerHTML = "Mision completada";
			btnMisionMiller.disabled = true;
			btnMisionMiller.addEventListener("click", () => {
				console.log("nada");
			});
		} else {
			btnMisionMiller.addEventListener("click", () => {
				console.log("click");
				moveToMillerScene();
				infoDisplay.style.display = "none";
				continueButton.style.display = "none";
				tarsDisplay.style.display = "none";
			});
		}
	}

	async init() {
		await createScene(renderer);
		// hideModels();
	}

	update() {
		renderer.render(scene, camera);
		animate();
		animateStars();
		orbitControls.update();
	}
}

function playText() {
	continueButton.remove();
	let text = [
		"En 2067, la destrucción de las cosechas en la Tierra ha hecho que la agricultura sea cada vez más difícil y se vea amenazada la supervivencia de la humanidad",
		"Joseph Cooper, ex piloto de la NASA ha sido reclutado nuevamente para emprender una misión Interestelar para encontrar un planeta fuera de nuestra galaxia que pueda albergar vida humana",
		"Conociendo los peligros de la misión, Cooper decide dejar en la Tierra aquellos que él ama, en especial la pequeña Murph de tan solo 13 años",
		"La misión conformada por los astronautas Romilly, Doyle y Amelia podria tomar decadas, pues tendrian que evaluar los planetas cercanos al agujero negro Gargantúa",
	];

	let textTars = [
		"Soy TARS, un robot con inteligencia artificial que te acompañará en esta aventura interestelar. ",
		"Han pasado 2 años desde el despegue de Cooper de la Tierra, han atravesado el agujero de gusano de Saturno y ahora se encuentran en la Galaxia lejana que contiene a Gargantúa. ",
		"En la parte superior derecha podrás ver información que ayudará a entender la relatividad del tiempo en esta experiencia Interstellar.",
		"Actualmente Cooper tiene 35 años, Murph 15 años y nos encontramos en el año 2069.",
		"Te toca elegir qué experiencia vivir. Da clic en alguno de los planetas y descubre que sucederá.",
	];

	setTimeout(function () {
		infoDisplay.innerHTML = text[0];
	}, 1000);

	setTimeout(function () {
		infoDisplay.innerHTML = text[1];
	}, 9000);

	setTimeout(function () {
		infoDisplay.innerHTML = text[2];
	}, 20000);

	setTimeout(function () {
		infoDisplay.innerHTML = text[3];
	}, 30000);

	setTimeout(function () {
		infoDisplay.innerHTML = "";
		showModels();
	}, 40000);

	setTimeout(function () {
		tarsDisplay.innerHTML = textTars[0];
	}, 50000);

	setTimeout(function () {
		tarsDisplay.innerHTML = textTars[1];
	}, 60000);

	setTimeout(function () {
		tarsDisplay.innerHTML = textTars[2];
		actualizaInfo(35, 15, 2069);
	}, 70000);

	setTimeout(function () {
		tarsDisplay.innerHTML = textTars[3];
	}, 80000);

	setTimeout(function () {
		tarsDisplay.innerHTML = textTars[4];
	}, 90000);
}

function animate() {
	let now = Date.now();
	let deltat = now - currentTime;
	currentTime = now;
	let fract = deltat / 10000;
	let angle = Math.PI * 2 * fract;

	// Rotate the sphere group about its Y axis
	miller.rotation.y += angle;
	edmons.rotation.y += angle;
	manns.rotation.y += angle;
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

function createMaterials(mapUrl, bumpMapUrl, nombre, nombreTexture) {
	// Create a textre phong material for the cube
	// First, create the texture map
	textureMap = new THREE.TextureLoader().load(mapUrl);
	bumpMap = new THREE.TextureLoader().load(bumpMapUrl);
	materials[nombre] = new THREE.MeshPhongMaterial({
		bumpMap: bumpMap,
		bumpScale: 0.01,
	});
	materials[nombreTexture] = new THREE.MeshPhongMaterial({
		map: textureMap,
		bumpMap: bumpMap,
		bumpScale: 0.01,
	});
}

async function createScene(renderer) {
	// creamos la escena
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(
		45,
		canvas.width / canvas.height,
		1,
		4000
	);
	camera.position.set(20, 10, 80); // cambiamos la posicion de la camara
	scene.add(camera.position);

	// usamos los orbits controls para poder interactual con la escena de manera dinamica
	orbitControls = new OrbitControls(camera, renderer.domElement);

	//Añade estrellas
	addSphere();

	//Música a la escena
	var music = document.getElementById("audio");
	music.play();

	//Añade luces
	createAmbiente();

	tars_robot = new THREE.Object3D();
	tars_robot.position.set(40, -8, 28);
	tars_robot.rotateY(Math.PI / 25);

	tars_robot.scale.x = 0.08;
	tars_robot.scale.y = 0.08;
	tars_robot.scale.z = 0.08;

	// miller.position.set(-60,20,0);

	//edmons.position.set(15,0,15);

	miller.position.set(-10, -15, 0);
	edmons.position.set(20, 0, 15);
	manns.position.set(-80, 15, -10);

	//miller.position.set(0,0,-30);

	//edmons.position.set(30,0,-30);

	const millerMapUrl = "../images/millermap.jpg",
		millerBumpMapUrl = "../images/millermap.jpg";
	const edmonsMapUrl = "../images/edmonsmap.jpg",
		edmonsBumpMapUrl = "../images/edmonsbump.jpg";
	const mannsMapUrl = "../images/mannsmap.jpg",
		mannsBumpMapUrl = "../images/mannsbump.jpg";

	let urlMapsNames = [millerMapUrl, edmonsMapUrl, mannsMapUrl];

	let urlBumpsNames = [millerBumpMapUrl, edmonsBumpMapUrl, mannsBumpMapUrl];

	let elements = {};
	let elementsTextured = {};

	//Create Material
	for (let i = 0; i < 3; i++) {
		createMaterials(
			urlMapsNames[i],
			urlBumpsNames[i],
			names[i],
			namesTextures[i]
		);
	}
	// Create mesh
	let geometry = new THREE.SphereGeometry(2, 50, 50);

	for (let i = 0; i < 3; i++) {
		elements[i] = new THREE.Mesh(geometry, materials[names[i]]);
		elements[i].visible = false;
	}

	geometry = new THREE.SphereGeometry(2, 50, 50);
	for (let i = 0; i < 3; i++) {
		elementsTextured[i] = new THREE.Mesh(
			geometry,
			materials[namesTextures[i]]
		);
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

	miller.name = "Miller";
	edmons.name = "Edmons";
	manns.name = "Manns";

	await loadFBX("../assets/tars/OrangeBOT_FBX.fbx", tars_robot, 0.25);

	scene.add(miller);
	scene.add(edmons);
	scene.add(manns);
	scene.add(tars_robot);

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
	const screen = new THREE.PlaneGeometry(1100, 800, 100, 100);
	videoScreen = new THREE.Mesh(screen, videoMaterial);
	videoScreen.position.set(-300, -15, -1500);

	//Raycaster
	raycaster = new THREE.Raycaster();
	document.addEventListener("pointerdown", onDocumentPointer);
	scene.add(videoScreen);
}

function addSphere() {
	// The loop will move from z position of -1000 to z position 1000, adding a random particle at each position.
	for (var z = -1000; z < 1000; z += 20) {
		// Make a sphere (exactly the same as before).
		var geometry = new THREE.SphereGeometry(0.5, 32, 32);
		var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
		var sphere = new THREE.Mesh(geometry, material);

		// This time we give the sphere random x and y positions between -500 and 500
		sphere.position.x = Math.random() * 1000 - 500;
		sphere.position.y = Math.random() * 1000 - 500;

		// Then set the z position to where it is in the loop (distance of camera)
		sphere.position.z = z;

		// scale it up a bit
		sphere.scale.x = sphere.scale.y = 2;

		//add the sphere to the scene
		scene.add(sphere);

		//finally push it to the stars array
		stars.push(sphere);
	}
}

function animateStars() {
	// loop through each star
	for (var i = 0; i < stars.length; i++) {
		var star = stars[i];
		// and move it forward dependent on the mouseY position.
		star.position.z += i / 10;
		// if the particle is too close move it to the back
		if (star.position.z > 1000) star.position.z -= 2000;
	}
}

function onDocumentPointer(event) {
	event.preventDefault();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);

	let intersects = null;
	intersects = raycaster.intersectObjects(miller.children);

	let cual = "Miller";
	if (intersects.length == 0) {
		intersects = raycaster.intersectObjects(manns.children);
		cual = "Manns";
		if (intersects.length == 0) {
			intersects = raycaster.intersectObjects(edmons.children);
			cual = "Edmons";
		}
	}

	if (intersects.length > 0) {
		if (cual == "Miller") {
			console.log("miller");
			clicked = intersects[0].object;
			camera.position.set(-22, -30, 6.4);
			tars_robot.visible = false;
			millerText.style.display = "block";
			infoScenes.style.display = "none";
		} else if (cual == "Edmons") {
			console.log("edmons");
			clicked = intersects[0].object;
			camera.position.set(25.63, -0.2074, 17.785);
			tars_robot.visible = false;
			edmonsText.style.display = "block";
			infoScenes.style.display = "none";
		} else if (cual == "Manns") {
			console.log("manns");
			clicked = intersects[0].object;
			camera.position.set(-89.52, 16.79, -9.7945);
			tars_robot.visible = false;
			mannsText.style.display = "block";
			infoScenes.style.display = "none";
		}
	} else {
		if (clicked)
			setTimeout(function () {
				camera.position.set(20, 10, 80);
				tars_robot.visible = true;
				millerText.style.display = "none";
				mannsText.style.display = "none";
				edmonsText.style.display = "none";
				infoScenes.style.display = "block";
				clicked = null;
			}, 500);
	}
}

function actualizaInfo(edadCopper, edadMurph, anio) {
	let texto =
		"Edad de Cooper: " +
		edadCopper.toString() +
		"</br>" +
		"Edad de Murph: " +
		edadMurph.toString() +
		"</br>" +
		"Año: " +
		anio.toString();
	console.log(texto);
	let finalText = texto.toString();
	infoScenes.innerHTML = finalText;
}

function showModels() {
	miller.visible = true;
	edmons.visible = true;
	manns.visible = true;
	tars_robot.visible = true;
	videoScreen.visible = true;
}

function hideModels() {
	miller.visible = false;
	edmons.visible = false;
	manns.visible = false;
	tars_robot.visible = false;
	videoScreen.visible = false;
}

async function loadFBX(fbxModelUrl, parent, scale = 1) {
	try {
		let object = await new FBXLoader().loadAsync(fbxModelUrl);

		object.scale.set(scale, scale, scale);

		parent.add(object);
	} catch (err) {
		console.error(err);
	}
}
