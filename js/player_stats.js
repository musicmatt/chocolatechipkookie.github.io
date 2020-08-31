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
    var data = await getFile("data/data.json", octokit);
    // Decode base64 file content and parse json
    data = JSON.parse(b64_to_utf8(data.data.content));
    externalData = data;
    // Create datalist for HTML
    var datalist = data.player_names.map( player => `<option value="${player}">`).join('\n');
    document.getElementById("datalist-players").innerHTML = datalist;

    // Add buttons
    var buttons = data.player_names.map( player => `<button class="player-link-button" onclick="displayPlayerStats('${player}');">${player}</button>`).join('\n');
    document.getElementById("player-list").innerHTML = buttons;
}

loadExternalData();

//Add listener to password field
var game_search = document.getElementById("player-search");
game_search.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        displayPlayerStats(game_search.value);
    }
});

window.displayPlayerStats = function (name){
    console.log(name);
    return;
}
