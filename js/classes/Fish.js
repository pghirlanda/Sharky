export default class Fish {
    async build(scene, canvas, posFishX, posFishZ, position, scaling){
        //Gestion de la scene et du canvas
        this.scene = scene;
        this.canvas = canvas;

        //Gestion des informations des poissons (position, échelle)
        this.infoFish = position;
        this.scaling = scaling;

        //Création des poissons
        this.patronFish = await this.#createFish(scene, posFishX, posFishZ);
    }

    //Gestion des informations des poissons
    checkInfoFish(deltaTime){
        //Mise à jour de la position des poissons
        this.#updatePositionFish();
    }

    //Création des poissons
    async #createFish(scene, positionX, positionZ){
        let patronFish = BABYLON.MeshBuilder.CreateBox("patronFishs", {width: 20, depth: 20, height: 10}, scene);
        patronFish.isVisible = false;
        patronFish.checkCollisions = false;
        patronFish.position = new BABYLON.Vector3(positionX, this.infoFishY, positionZ);
        patronFish.ellipsoid = new BABYLON.Vector3(1, 1.5, 1);
        patronFish.ellipsoidOffset = new BABYLON.Vector3(0, 1.5, 0);
        patronFish.bakeTransformIntoVertices(BABYLON.Matrix.Translation(0, 1.5, 0));

        //Importation des poissons
        const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "././models/Fish/", "fish.glb", scene);
        var fish = result.meshes[0];

        //Gestion de la position et de la taille des poisson
        fish.position = new BABYLON.Vector3(5, -2, 0);
        fish.scaling = new BABYLON.Vector3(0.6, 0.6, 0.6);

        //Définition du patron comme parent des poissons
        fish.parent = patronFish;
        this.fish = patronFish;

        return patronFish;
    }

    //Mise à jour de la position des poissons
    #updatePositionFish(){    
        //Position
        this.infoFishX = this.fish.position.x;
        this.infoFishY = this.fish.position.y;
        this.infoFishZ = this.fish.position.z;

        //Rotation
        this.infoFishRX = this.fish.rotation.x;
        this.infoFishRY = this.fish.rotation.y;
        this.infoFishRZ = this.fish.rotation.z;
    }

    //Suppression des poissons
    deleteFish(){
        this.fish.dispose();
        console.log("Poissons mangés !");
    }
}