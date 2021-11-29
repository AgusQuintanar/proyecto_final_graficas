import { MTLLoader } from "../libs/three.js/r131/loaders/MTLLoader.js";
import { OBJLoader } from "../libs/three.js/r131/loaders/OBJLoader.js";
import { GLTFLoader } from "../libs/three.js/r131/loaders/GLTFLoader.js";
import { FBXLoader } from "../libs/three.js/r131/loaders/FBXLoader.js";

export function onError(err) {
	console.error(err);
}

export function onProgress(xhr) {
	if (xhr.lengthComputable) {
		const percentComplete = (xhr.loaded / xhr.total) * 100;
		console.log(
			xhr.target.responseURL,
			Math.round(percentComplete, 2) + "% downloaded"
		);
	}
}

export async function loadGLTF(url, parent, scale = 1, rotateX = 0) {
	try {
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

		parent.scale.set(scale, scale, scale);

		// object.scene.scale.set(scale, scale, scale);

		object.scene.rotateX(rotateX);

		parent.add(object.scene);
	} catch (err) {
		onError(err);
	}
}

export async function loadObj(objModelUrl, parent) {
	try {
		const object = await new OBJLoader().loadAsync(
			objModelUrl.obj,
			onProgress,
			onError
		);
		let texture = objModelUrl.hasOwnProperty("normalMap")
			? new THREE.TextureLoader().load(objModelUrl.map)
			: null;
		let normalMap = objModelUrl.hasOwnProperty("normalMap")
			? new THREE.TextureLoader().load(objModelUrl.normalMap)
			: null;
		let specularMap = objModelUrl.hasOwnProperty("specularMap")
			? new THREE.TextureLoader().load(objModelUrl.specularMap)
			: null;

		object.traverse(function (child) {
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
	} catch (err) {
		onError(err);
	}
}

export async function loadObjMtl(objModelUrl, parent, scale = 1) {
	try {
		const mtlLoader = new MTLLoader();

		const materials = await mtlLoader.loadAsync(
			objModelUrl.mtl,
			onProgress,
			onError
		);

		materials.preload();

		const objLoader = new OBJLoader();

		objLoader.setMaterials(materials);

		const object = await objLoader.loadAsync(
			objModelUrl.obj,
			onProgress,
			onError
		);

		object.traverse(function (child) {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});

		object.scale.set(scale, scale, scale);

		parent.add(object);
	} catch (err) {
		onError(err);
	}
}

export async function loadFBX(fbxModelUrl, parent, scale = 1) {
	try {
		let object = await new FBXLoader().loadAsync(fbxModelUrl);

		object.scale.set(scale, scale, scale);

		parent.add(object);
	} catch (err) {
		console.error(err);
	}
}
