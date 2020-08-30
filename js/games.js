import { Octokit } from "https://cdn.pika.dev/@octokit/core";

// Updates the visibility of the container
window.hideContainer = function (elem, checkbox_container){
    //Fetches the checkbox container
    var x = document.getElementById(checkbox_container);

    // Updates the style and button text
    if (x.style.display === "none") {
        x.style.display = "block";
        elem.value = "Hide";
    } else {
        x.style.display = "none";
        elem.value = "Show";
    }
}

var externalData = null;

// Loads players and corporations from database
async function loadExternalData(){
    const octokit = new Octokit();
    // Fetch file from git
    var data = await getFile("data/games.json", octokit);
    // Decode base64 file content and parse json
    var data = JSON.parse(b64_to_utf8(data.data.content));
    externalData = data;
    // Add names to datalist
    var names = data.map(game => game.name);
    // Create datalist for HTML
    var datalist = names.map( name => `<option value="${name}">`).join('\n');
    document.getElementById("datalist-games").innerHTML = datalist;

    // Add buttons
    var buttons = names.map( name => `<button class="game-link-button" onclick="reditectToSite(this);" value="${name}">${name}</button>`).join('\n');
    document.getElementById("game-link-list").innerHTML = buttons;
}

loadExternalData();


window.reditectToSite = async function(elem){
    return;
}