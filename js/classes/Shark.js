export default class Shark {
    async build(scene, canvas, posDepart, scaling){
        //Gestion de la scene et du canvas
        this.scene = scene;
        this.canvas = canvas;

        //Gestion des informations du requin (position, échelle, vitesse)
        this.infoShark = posDepart;
        this.scaling = scaling;
        this.speed = 0.6;

        //Axe de mouvement X, Z et Y
        this.axisMovement = [false, false, false, false, false, false, false];
        this.#addListenerMovement();

        //Création du requin
        this.patronShark = await this.#createShark(scene);
        //Création de la caméra qui suit le requin
        this.camera = this.#createCamera(scene);
    }

    //Gestion des actions du requin
    checkActionShark(deltaTime){
        //Déplacement du requin
        this.#moveShark(deltaTime);

        //Mise à jour de la position du requin
        this.#updatePositionShark();

        //Gestion de l'animation "mordre" du requin
        this.#sharkBite(this.scene);
    }

    //Création du requin
    async #createShark(scene){
        let patronShark = BABYLON.MeshBuilder.CreateBox("patronPlayer", { width: 10, depth: 30, height: 10 }, scene);
        patronShark.isVisible = false;
        patronShark.checkCollisions = true;
        patronShark.position = new BABYLON.Vector3(this.infoSharkX, this.infoSharkY, this.infoSharkZ);
        patronShark.ellipsoid = new BABYLON.Vector3(1, 1.5, 1);
        patronShark.ellipsoidOffset = new BABYLON.Vector3(0, 1.5, 0);
        patronShark.bakeTransformIntoVertices(BABYLON.Matrix.Translation(0, 1.5, 0));

        //Déclaration de la musique "grognement"
        this.music1 = new BABYLON.Sound("sharkyGrr", "sounds/bulle_de_sharky.mp3", scene);
        this.music2 = new BABYLON.Sound("tadantadan", "sounds/dent_mer.mp3", scene);

        //Importation du requin
        const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "././models/Shark/", "shark.glb", scene);
        var shark = result.meshes[0];

        //Gestion de la position et de la taille du requin
        shark.position = new BABYLON.Vector3(0, -1, 0);
        shark.scaling = new BABYLON.Vector3(2, 2, 2);

        //Définition du patron comme parent au requin
        shark.parent = patronShark;
        this.shark = patronShark;

        //Activation des collisions
        shark.checkCollisions = false;

        return patronShark;
    }

    //Création de la caméra suivant le requin
    #createCamera(scene) {
        let camera = new BABYLON.ArcRotateCamera("SharkRotateCamera", -Math.PI/2, 1, 250, this.shark, scene);
        camera.angularSensibilityX = 2000;
        camera.angularSensibilityY = 2000;

        camera.upperBetaLimit = Math.PI / 2.3;
        camera.lowerBetaLimit = Math.PI / 3;

        camera.upperRadiusLimit = 150;
        camera.lowerRadiusLimit = 15;
        camera.attachControl(this.canvas, false);

        scene.activeCamera = camera;
        return camera;
    }

    //Gestion du mouvement du requin 
    #moveShark(deltaTime){
        let fps = 1000 / deltaTime;
        let relativeSpeed = this.speed / (fps / 60);
        let rotationSpeed = 0.05;

        if (this.axisMovement[0]) {
            let forward = new BABYLON.Vector3(parseFloat(-Math.sin(parseFloat(this.shark.rotation.y))) * relativeSpeed, 0, parseFloat(-Math.cos(parseFloat(this.shark.rotation.y))) * relativeSpeed);
            this.shark.moveWithCollisions(forward);
        } 
        if (this.axisMovement[1]) {
            let backward = new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(this.shark.rotation.y))) * relativeSpeed, 0, parseFloat(Math.cos(parseFloat(this.shark.rotation.y))) * relativeSpeed);
            this.shark.moveWithCollisions(backward);
        }
        if (this.axisMovement[2]){
            this.shark.rotation.y += rotationSpeed;
        }
        if (this.axisMovement[3]){
            this.shark.rotation.y -= rotationSpeed;
        }
        if ((this.axisMovement[5]) && (this.shark.position.y <= 10)){
            let up = new BABYLON.Vector3(0, parseFloat(Math.sin(parseFloat(this.shark.rotation.y))) * relativeSpeed, 0);
            this.shark.moveWithCollisions(up);
        }
        if ((this.axisMovement[6]) && (this.shark.position.y >= -3)){
            let down = new BABYLON.Vector3(0, parseFloat(-Math.sin(parseFloat(this.shark.rotation.y))) * relativeSpeed, 0);
            this.shark.moveWithCollisions(down);
        }
        if (this.shark.position.y > 10){
            this.shark.position.y = 10;
        }
        if (this.shark.position.y < -3){
            this.shark.position.y = -3;
        }
    }

    //Mise à jour de la position du requin
    #updatePositionShark(){    
        //Position
        this.infoSharkX = this.shark.position.x;
        this.infoSharkY = this.shark.position.y;
        this.infoSharkZ = this.shark.position.z;

        // Rotation
        this.infoSharkRX = this.shark.rotation.x;
        this.infoSharkRY = this.shark.rotation.y;
        this.infoSharkRZ = this.shark.rotation.z;
    }

    //Gestion des animations du requin
    #sharkBite(scene){
        //Création des particules
        var particleSystem = new BABYLON.ParticleSystem("particles", 10, scene);

        //Texture des particules
        particleSystem.particleTexture = new BABYLON.Texture("textures/bulles.jpg", scene);

        // Lieu où les particules sont émises
        particleSystem.emitter = new BABYLON.Vector3(this.shark.position.x - 0.1, this.shark.position.y - 2.95, this.shark.position.z - 15); // the starting object, the emitter

        // Direction des particules
        particleSystem.direction1 = new BABYLON.Vector3(-1, 10, 1);

        // taille des particules
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.7;

        // Temps d'émission des particules
        particleSystem.targetStopDuration = 3;

        // Keyboard events
        var inputMap ={};
        scene.actionManager = new BABYLON.ActionManager(scene);
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        // Déclaration des animations du requins
        const grr = scene.getAnimationGroupByName("bite");
        const cercle = scene.getAnimationGroupByName("circling");
        
        var animating = true;

        scene.onBeforeRenderObservable.add(() => {
            var keydown = false;
            if (inputMap["a"]){
                keydown = true;
            }
            if (inputMap["c"]){
                keydown = true;
            }
            if (keydown) {
                if (!animating) {
                    animating = true;
                    if (inputMap["a"]){
                        grr.start(false, 0.9, grr.from, grr.to, false);
                        this.music1.play(); 
                        particleSystem.start();
                    }
                    else if (inputMap["c"]){
                        cercle.start(false, 4.0, cercle.from, cercle.to, true);
                        this.music2.play();
                    }
                }
            }
            else {
                if (animating){
                    animating = false;
                }
            }
        })
    }

    //Création d'un listener pour le mouvement du requin
    #addListenerMovement() {
        window.addEventListener('keydown', (event) => {
            if ((event.key === "z") || (event.key === "Z")) {
                this.axisMovement[0] = true;
            } else if ((event.key === "s") || (event.key === "S")) {
                this.axisMovement[1] = true;
            } else if ((event.key === "d") || (event.key === "D")) {
                this.axisMovement[2] = true;
            } else if ((event.key === "q") || (event.key === "Q")) {
                this.axisMovement[3] = true;
            } else if (event.key === " ") {
                this.axisMovement[4] = true;
            } else if ((event.key === "r") || (event.key === "R")) {
                this.axisMovement[5] = true;
            } else if ((event.key === "e") || (event.key === "E")) {
                this.axisMovement[6] = true;
            }
        }, false);

        window.addEventListener('keyup', (event) => {
            if ((event.key === "z") || (event.key === "Z")) {
                this.axisMovement[0] = false;
            } else if ((event.key === "s") || (event.key === "S")) {
                this.axisMovement[1] = false;
            } else if ((event.key === "d") || (event.key === "D")) {
                this.axisMovement[2] = false;
            } else if ((event.key === "q") || (event.key === "Q")) {
                this.axisMovement[3] = false;
            } else if (event.key === " ") {
                this.axisMovement[4] = false;
            } else if ((event.key === "r") || (event.key === "R")) {
                this.axisMovement[5] = false;
            } else if ((event.key === "e") || (event.key === "E")) {
                this.axisMovement[6] = false;
            }
        }, false);
    }
}