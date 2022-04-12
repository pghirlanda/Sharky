import {startGame} from "./main.js"

document.addEventListener("DOMContentLoaded", async function() {
    let divButton = document.getElementById("buttonPlay");
    divButton.onclick = async () => {       
        let divHome = document.getElementById("HOME").style.display = "none";
        await startGame("myCanvas");
    }
}, false);
