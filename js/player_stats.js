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

window.playerSearch = function(){
    displayPlayerStats(document.getElementById("player-search").value);
}

window.displayPlayerStats = function (name){

    var player_data = externalData.player_stats[name];
    console.log(player_data);

    document.getElementById("player-name").value = name;    

    document.getElementById("player-total-games").value = player_data.games.length;
    document.getElementById("fave-corp-number").value = `${player_data.fave_corp.total} games / ${player_data.fave_corp.wins} wins`;
    document.getElementById("fave-corp").value = player_data.fave_corp.name;

    document.getElementById("best-corp-number").value = `${player_data.best_corp.wins/player_data.best_corp.total * 100}% ( ${player_data.best_corp.wins} / ${player_data.best_corp.total} )`;
    document.getElementById("best-corp").value = player_data.best_corp.name;

    document.getElementById("win-corp-number").value = `${player_data.most_wins.wins} of ${player_data.most_wins.total} games`;
    document.getElementById("win-corp").value = player_data.most_wins.name;

    document.getElementById("stat-container").style.display = "block";

    player_data.best_games.forEach(function(game){
        var element_id = `${game.players}-game`;
        document.getElementById(element_id + "-points").value = `${game.score} points scored`;
        document.getElementById(element_id + "-link").onclick = function(){window.location = `/games/${game.id}.html`;};
        document.getElementById(element_id).style.display = "block";
    });

    document.getElementById("game-container").style.display = "block";
    return;
}
