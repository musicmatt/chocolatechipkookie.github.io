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
    var buttons = names.map( name => `<button class="game-link-button" onclick="window.location='/games.html';">${name}</button>`).join('\n');
    document.getElementById("game-link-list").innerHTML = buttons;
}

loadExternalData();

// Generates the html for the page
function generateGameSite(game){
    var names = game.scores.map(score => `                    <td class="table-cell" style="font-weight: bolder; font-family: 'Courier New', Courier, monospace;">${score.player}</td>`).join('\n');
    var corp = game.scores.map(score => `                    <td class="table-cell">${score.corporation}</td>`).join('\n');
    var tr = game.scores.map(score => `                    <td class="table-cell"><input class="table-input" type="text" disabled value="${score.tr}"></td>`).join('\n');
    var award = game.scores.map(score => `                    <td class="table-cell"><input class="table-input" type="text" disabled value="${score.awards}"></td>`).join('\n');
    var milestones = game.scores.map(score => `                    <td class="table-cell"><input class="table-input" type="text" disabled value="${score.milestones}"></td>`).join('\n');
    var greenery = game.scores.map(score => `                    <td class="table-cell"><input class="table-input" type="text" disabled value="${score.greenery}"></td>`).join('\n');
    var cities = game.scores.map(score => `                    <td class="table-cell"><input class="table-input" type="text" disabled value="${score.cities}"></td>`).join('\n');
    var cards = game.scores.map(score => `                    <td class="table-cell"><input class="table-input" type="text" disabled value="${score.cards}"></td>`).join('\n');
    var lead = game.scores.map(score => `                    <td class="table-cell"><input class="table-input" type="text" disabled value="${score.lead}"></td>`).join('\n');
    var total = game.scores.map(score => `                    <td class="table-cell"><input class="table-input" type="text" disabled value="${score.total}"></td>`).join('\n');
    var rank = game.scores.map(score => `                    <td class="table-cell"><input class="table-input" type="text" disabled value="${score.rank}"></td>`).join('\n');
    var note = game.scores.map(score => `                    <td class="table-cell"><input class="table-input" type="text" disabled value="${score.note}"></td>`).join('\n');

    lead = 
        `
                <tr id="gold-lead">
                    <td class="table-cell">Gold lead</td>
${lead}
                </tr>
        `

    if(game.scores.map(score => score.lead).every(item => item === 0)){
        lead = ""
    }

    var turmoil = ""

    if(game.mode.includes("Turmoil")){

    turmoil = 
        `
                <tr id="turmoil-points">
                    <td class="table-cell">Turmoil</td>
${game.scores.map(score => `                    <td class="table-cell"><input class="table-input" type="text" disabled value="${score.turmoil}"></td>`).join('\n')}
                </tr>
        `
    }


    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <link href="../css/meta.css" rel="stylesheet" type="text/css">    
    <link href="../css/game.css" rel="stylesheet" type="text/css">    
    <link href="../css/table.css" rel="stylesheet" type="text/css">
</head>
<body>
    <div class="container page-title">
        Game1
    </div>

    <div class="container">
        <div class="container-banner">
            Game outcome
        </div>
        <div class="sub-container">
            <div class="sub-container--element">
                <label for="name-input">Name:</label>
                <input type="text" class="option-input" id="name-input" disabled value="${game.name}">
            </div>
            <div class="sub-container--element">
                <label for="date-input">Date:</label>
                <input type="date" class="option-input" id="date-input" disabled value="${game.date}" required="required">
            </div>
            <div class="sub-container--element">
                <label for="mode-input">Mode:</label>
                <input type="text" class="option-input" id="mode-input" disabled value="${game.mode_code}">
            </div>
            <div class="sub-container--element">
                <label for="map-input">Map:</label>
                <input type="text" class="option-input" id="map-input" disabled value="${game.map}">
            </div>
            <div class="sub-container--element">
                <label for="players-input">Players:</label>
                <input type="text" class="option-input" id="players-input" disabled value="${game.players}">
            </div>
            <div class="sub-container--element">
                <label for="generations-input">Generations:</label>
                <input type="text" class="option-input" id="generations-input" disabled value="${game.generation}">
            </div>
            <div class="sub-container--element">
                <label for="winner-input">Winner:</label>
                <input type="text" class="option-input" id="winner-input" style="font-weight: bolder; font-family: 'Courier New', Courier, monospace;" disabled value="${game.winner}">
            </div>
            <div class="sub-container--element">
                <label for="win-corp-input">Winner corporation:</label>
                <input type="text" class="option-input" id="win-corp-input" disabled value="${game.win_corp}">
            </div>
            <div class="sub-container--element">
                <label for="win-score-input">Winner points:</label>
                <input type="text" class="option-input" id="win-score-input" disabled value="${game.win_score}">
            </div>
        </div>

        <div class="container-banner">
            Points
        </div>
        <div class="sub-container sub-container--element" id="points-table-div">
            <table class="table" id="points-table">
                <tr id="player-names">                    
                    <td class="table-cell">Name</td>
${names}
                </tr>
                <tr id="player-corporations">                    
                    <td class="table-cell">Corporation</td>
${corp}
                </tr>
                <tr id="tr-points">
                    <td class="table-cell">TR</td>
${tr}
                </tr>
                <tr id="award-points">
                    <td class="table-cell">Awards</td>
${award}
                </tr>
                <tr id="milestone-points">
                    <td class="table-cell">Milestones</td>
${milestones}
                </tr>
                <tr id="greenery-points">
                    <td class="table-cell">Greenery</td>
${greenery}
                </tr>
                <tr id="city-points">
                    <td class="table-cell">Cities</td>
${cities}
                </tr>
                <tr id="card-points">
                    <td class="table-cell">Cards</td>
${cards}
                </tr>
${turmoil}
                <tr id="total-points">
                    <td class="table-cell">Total</td>
${total}
                </tr>
${lead}
                <tr id="ranks">
                    <td class="table-cell">Rank</td>
${rank}
                </tr>
                <tr id="player-note">
                    <td class="table-cell">Notes</td>
${note}
                </tr>
            </table>
        </div>
    </div>
    <div class="link-button-wrapper">
        <button class="link-button" onclick="window.location='/index.html';">Main page</button>
    </div>
</body>
<footer>
</footer>
`
}