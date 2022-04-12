//Importation des classes
import Fish from "./classes/Fish.js";
import Shark from "./classes/Shark.js";

//Déclaration des variables utiles
let canvas;
let engine;
let scene;
let ground;
let inputStates = {};
let shark;
let fish;
let creation = false;
let nbFish = 0;
let intersection;
let score = 0;
let timer = 0;
let camera;


export async function startGame(canvasId){
  //Récupération du canvas
  canvas = document.querySelector("#myCanvas");
  canvas = document.getElementById(canvasId);
  //Création d'une instance du moteur 3D
  engine = new BABYLON.Engine(canvas, true);

  //Création de la scène
  scene = await createScene();
  //Activation de la physique
  scene.enablePhysics(new BABYLON.Vector3(0, -4.81, 0), new BABYLON.CannonJSPlugin());
  
  //Modification des paramètres par défault
  modifySettings();

  //Récupération du requin
  shark = new Shark();
  await shark.build(scene, canvas);
  shark.patronShark.actionManager = new BABYLON.ActionManager(scene);

  //Création des premiers poissons
  await createFish(scene);

  //La taille de la sphère va permettre de nous dire si le requin est en intersection avec les poissons
  intersection = new BABYLON.Mesh.CreateSphere("sphere", 32, 0.1, scene);
  
  //Boucle d'animation principale (60 fois / seconde)
  engine.runRenderLoop(async () => {
    //Action du requin
    shark.checkActionShark(engine.getDeltaTime());

    //Gestion de manger les poissons
    if(nbFish != 0){
      intersectionFish(scene);
      mangerFish(scene);
    }

    //Gestion de si les poissons se créent sous la map
    if (timer > 5000){
      timer = 0;
      fish.deleteFish();
      nbFish -= 1;
      createFish(scene);
    }
    timer++;

    //Mise à jour du score
    updateScore();

    scene.render();
  });
}

//Création de la scène
async function createScene() {
  //Initialisation de la scène
  let scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.14, 0.44, 0.67);

  //Création des lumières
  createLights(scene);

  //Création du sol
  createGround(scene);

  //Création de la skybox
  createSkybox(scene);

  //Création de la déco
  await createDeco(scene);

  //Création des caméras
  camera = createFreeCamera(scene);

  return scene;
}

//Création des lumières
function createLights(scene) {
  // Lumière principale
  var light = new BABYLON.HemisphericLight("Light", new BABYLON.Vector3(-0.7, 0.3, -0.7), scene);
  light.diffuse = new BABYLON.Color3(0.89, 0.89, 0.78);
  light.groundColor = new BABYLON.Color3(0.56, 0.56, 0.57);
  light.intensity = 0.8; 

  // Lumière secondaire
  var lightD = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0.7, -0.3, 0.7), scene);
  lightD.position = new BABYLON.Vector3(20, 60, 20);
  lightD.intensity = 1; 
  light.parent = lightD;
}

//Création de la map
function createGround(scene){
  ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "assets/map/heightMap.png", 100, 100, 100, 0, 10, scene, false, (mesh) => {
    var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture("assets/map/ground.jpg", scene);
    groundMaterial.diffuseTexture.uScale = 6;
    groundMaterial.diffuseTexture.vScale = 6;
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    ground.position.y = -5;
    ground.scaling = new BABYLON.Vector3(4,7,4);
    ground.material = groundMaterial;
    ground.receiveShadows = true;
    ground.checkCollisions = true;
  });

  //Gestion de la position de la map
  ground.position.x = 150;
  ground.position.z = 150;

  //ground partie 2
  var ground2 = BABYLON.Mesh.CreateGround("ground2", 100, 100, 100, scene, false);
  var ground2Material = new BABYLON.StandardMaterial("ground2", scene);
  ground2.material = ground2Material;
  ground2Material.diffuseTexture = new BABYLON.Texture("assets/map/ground.jpg", scene);
  ground2Material.diffuseTexture.uScale = 6;
  ground2Material.diffuseTexture.vScale = 6;
  ground2Material.specularColor = new BABYLON.Color3(0, 0, 0);
  ground2.scaling = new BABYLON.Vector3(10,10,10);
  ground2.position.x = 150;
  ground2.position.y = -5.1;
  ground2.position.z = 150;
  ground2.checkCollisions = true;
  
  // Water
  var water = BABYLON.Mesh.CreateGround("waterMesh", 100, 100, 100, scene, false);
  var waterMaterial = new BABYLON.StandardMaterial("water", scene);
  water.material = waterMaterial;
  waterMaterial.diffuseTexture = new BABYLON.Texture("assets/map/waterbump.png", scene);
  waterMaterial.alpha = 0.5;
  waterMaterial.diffuseTexture.uScale = 6;
  waterMaterial.diffuseTexture.vScale = 6;
  water.position.x = 150;
  water.position.y = 15;
  water.position.z = 150;
  water.scaling = new BABYLON.Vector3(10,10,10);
  water.checkCollisions = true;
}

//Création d'une skybox
function createSkybox(scene) {
  // Import the .env file as a CubeTexture
  const texture = new BABYLON.CubeTexture('./assets/map/environment.env', scene);
  // Create a skybox mesh using this texture
  const skybox = scene.createDefaultSkybox(texture, true, 10000, 0.1);
}

//Création de la déco
async function createDeco(scene){
  //Palmiers
  importPalmTree(scene, new BABYLON.Vector3(81, 15, 106));
  importPalmTree(scene, new BABYLON.Vector3(69, 23, 120));
  importPalmTree(scene, new BABYLON.Vector3(192, 22, 195));
  importPalmTree(scene, new BABYLON.Vector3(136, 24, 239));
  importPalmTree(scene, new BABYLON.Vector3(186, 30, 169));
  importPalmTree(scene, new BABYLON.Vector3(50, 15, 178));

  //Cabane
  const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "././models/Deco/", "cabane.glb", scene);
  var cabane = result.meshes[0];
  let boisMaterial = new BABYLON.StandardMaterial("boisMaterial", scene);
  boisMaterial.diffuseTexture = new BABYLON.Texture("./textures/bois.jpg", scene);
  for (var i = 0; i < result.meshes.length; i++) {
    result.meshes[i].material = boisMaterial;
  }
  cabane.scaling = new BABYLON.Vector3(3, 3, 3);
  cabane.position = new BABYLON.Vector3(133, 38, 165);
  cabane.rotation.y = 180;

  //Ponton
  const resultPonton = await BABYLON.SceneLoader.ImportMeshAsync(null, "././models/Deco/", "ponton.glb", scene);
  var ponton = resultPonton.meshes[0];
  for (var i = 0; i < resultPonton.meshes.length; i++) {
    resultPonton.meshes[i].material = boisMaterial;
  }
  ponton.scaling = new BABYLON.Vector3(0.02, 0.02, 0.02);
  ponton.position = new BABYLON.Vector3(90, 11, 90);
  ponton.checkCollisions = true;

  //Coraux
  for (var i = 0; i < 9; i++){
    //1er type de corail
    let x1 = Math.floor(Math.random() * (600 + 300) - 300);
    let z1 = Math.floor(Math.random() * (600 + 300) - 300);
    importCoral(scene, new BABYLON.Vector3(x1, -5.1, z1));

    //2eme type de corail
    let x2 = Math.floor(Math.random() * (600 + 300) - 300);
    let z2 = Math.floor(Math.random() * (600 + 300) - 300);
    importCoral2(scene, new BABYLON.Vector3(x2, -5.1, z2));

    //3eme type de corail
    let x3 = Math.floor(Math.random() * (600 + 300) - 300);
    let z3 = Math.floor(Math.random() * (600 + 300) - 300);
    importCoral3(scene, new BABYLON.Vector3(x3, -4, z3));

    //4eme type de corail
    let x4 = Math.floor(Math.random() * (600 + 300) - 300);
    let z4 = Math.floor(Math.random() * (600 + 300) - 300);
    importCoral4(scene, new BABYLON.Vector3(x4, -5.1, z4));
  }
}

//Imporation des palmiers
async function importPalmTree(scene, position){
  const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "././models/Deco/", "Palm-tree.glb", scene);
  var palmTree = result.meshes[0];
  palmTree.position = position;
}

//Importation des coraux type 1
async function importCoral(scene, position){
  const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "././models/Deco/", "coral.glb", scene);
  var coral = result.meshes[0];
  coral.position = position;
  coral.scaling = new BABYLON.Vector3(0.7, 0.7, 0.7);
}

//Importation des coraux type 2
async function importCoral2(scene, position){
  const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "././models/Deco/", "coral2.glb", scene);
  var coral = result.meshes[0];
  let corailMaterial = new BABYLON.StandardMaterial("corailMaterial", scene);
  corailMaterial.diffuseTexture = new BABYLON.Texture("./textures/corail2.jpg", scene);
  for (var i = 0; i < result.meshes.length; i++) {
    result.meshes[i].material = corailMaterial;
  }
  coral.position = position;
  coral.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);
}

//Importation des coraux type 3
async function importCoral3(scene, position){
  const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "././models/Deco/", "coral3.glb", scene);
  var coral = result.meshes[0];
  let corailMaterial = new BABYLON.StandardMaterial("corailMaterial", scene);
  corailMaterial.diffuseTexture = new BABYLON.Texture("./textures/corail3.jpg", scene);
  for (var i = 0; i < result.meshes.length; i++) {
    result.meshes[i].material = corailMaterial;
  }
  coral.position = position;
  coral.scaling = new BABYLON.Vector3(2.5, 2.5, 2.5);
  coral.rotation.z = 180;
}

//Importation des coraux type 4
async function importCoral4(scene, position){
  const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "././models/Deco/", "coral4.glb", scene);
  var coral = result.meshes[0];
  let corailMaterial = new BABYLON.StandardMaterial("corailMaterial", scene);
  corailMaterial.diffuseTexture = new BABYLON.Texture("./textures/corail4.png", scene);
  for (var i = 0; i < result.meshes.length; i++) {
    result.meshes[i].material = corailMaterial;
  }
  coral.position = position;
  coral.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
}

//Création de la caméra de base
function createFreeCamera(scene) {
  let camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0, 50, 0), scene);
  camera.attachControl(canvas);
  // prevent camera to cross ground
  camera.checkCollisions = true; 
  // avoid flying with the camera
  camera.applyGravity = false;

  // Add extra keys for camera movements
  // Need the ascii code of the extra key(s). We use a string method here to get the ascii code
  camera.keysUp.push('z'.charCodeAt(0));
  camera.keysDown.push('s'.charCodeAt(0));
  camera.keysLeft.push('q'.charCodeAt(0));
  camera.keysRight.push('d'.charCodeAt(0));
  camera.keysUp.push('Z'.charCodeAt(0));
  camera.keysDown.push('S'.charCodeAt(0));
  camera.keysLeft.push('Q'.charCodeAt(0));
  camera.keysRight.push('D'.charCodeAt(0));

  return camera;
}

//Création des poissons
async function createFish(scene) {
  //Récupération des poissons
  fish = new Fish();
  //Génération des coordonnées aléatoires des poissons
  let x = Math.floor(Math.random() * (600 + 300) - 300);
  let z = Math.floor(Math.random() * (600 + 300) - 300);
  await fish.build(scene, canvas, x, z);
  console.log("Poissons créés...");
  nbFish++;
}

//Fonction pour enregistrer le fait que le requin est ou non dans le banc de poissons
function intersectionFish(scene) {
  //On change la taille lorsque le requin est dans le banc
  shark.patronShark.actionManager.registerAction(
    new BABYLON.SetValueAction(
    {
      trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
      parameter: fish.patronFish,
    }
    , intersection, "scaling", new BABYLON.Vector3(2, 2, 2)
  ));

  //On change la taille lorsque le requin est hors du banc
  shark.patronShark.actionManager.registerAction(
    new BABYLON.SetValueAction(
    {
      trigger: BABYLON.ActionManager.OnIntersectionExitTrigger,
      parameter: fish.patronFish,
    }
    , intersection, "scaling", new BABYLON.Vector3(1, 1, 1)
  ));
}

//Fonction pour voir si le requin peut ou non manger les poissons
async function mangerFish(scene){
  if ((intersection.scaling._x == 2) && (scene.inputStates.a == true)){
    fish.deleteFish();
    intersection.scaling = new BABYLON.Vector3(1, 1, 1);
    score++;
    nbFish -= 1;
    creation = true;
  }
  if (creation == true){
    await createFish(scene);
    creation = false;
  }
}

//Mise à jour du score
function updateScore(){
  document.getElementById("score").innerText = "Score : " + score;
}

//Modification des paramètres
function modifySettings() {
  // as soon as we click on the game window, the mouse pointer is "locked"
  // you will have to press ESC to unlock it
  scene.onPointerDown = () => {
      if(!scene.alreadyLocked) {
          console.log("requesting pointer lock");
          canvas.requestPointerLock();
      } else {
          console.log("Pointer already locked");
      }
  }

  document.addEventListener("pointerlockchange", () => {
      let element = document.pointerLockElement || null;
      if(element) {
          // lets create a custom attribute
          scene.alreadyLocked = true;
      } else {
          scene.alreadyLocked = false;
      }
  })

  // key listeners for the shark
  scene.inputStates = {};
  scene.inputStates.left = false;
  scene.inputStates.right = false;
  scene.inputStates.up = false;
  scene.inputStates.down = false;
  scene.inputStates.space = false;
  scene.inputStates.a = false;

  //add the listener to the main, window object, and update the states
  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "a" || event.key === "A") {
        scene.inputStates.a = true;
      }
    },
    false);

  //if the key will be released, change the states object 
  window.addEventListener('keyup', (event) => {
    if (event.key === "a"  || event.key === "A") {
      setTimeout(function(){console.log("1 sec avant de remettre le bouton mordre à false");}, 1000);
      scene.inputStates.a = false;
    }
  }, false);
}