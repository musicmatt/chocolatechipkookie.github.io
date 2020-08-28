import { Octokit } from "https://cdn.pika.dev/@octokit/core";

///////////////
//    UTIL
///////////////

function utf8_to_b64(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}

function b64_to_utf8(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}


//Capitalizes given string
function capitalize(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Gets the child of a parent
// If the child doesnt exist in the parent node, returns false
function getElementInsideContainer(containerID, childID) {
    var elm = document.getElementById(childID);
    var parent = elm ? elm.parentNode : {};
    return (parent.id && parent.id === containerID) ? elm : false;
}

// Gets active game modes
function getActiveModes(){
    var mode_selection = document.getElementById("expansion-checkbox-container");
    var mode = Array.from(mode_selection.querySelectorAll("input"))
        .filter(function(elem){return elem.checked;})
        .map(function(elem){return elem.value;});
    return mode;
}

//////////////
//    GIT
//////////////
const owner = 'ChocolateChipKookie';
const repo = "chocolatechipkookie.github.io";

//Loads git file
async function getFile(filepath, octokit){
    return octokit.request(`GET https://api.github.com/repos/${owner}/${repo}/contents/${filepath}`)
}

//Updates git file
async function updateFile(content, filepath, message='', octokit){
    var prev_blob = await getFile(filepath, octokit);
    
    const response = await octokit.request(`PUT https://api.github.com/repos/${owner}/${repo}/contents/${filepath}`, 
    {
        owner: owner,
        repo: repo,
        path: filepath,
        message: message,
        content: utf8_to_b64(content),
        sha: prev_blob.data.sha,
    });
    return response;
}

////////////////////
//     WARNING
////////////////////

function updateWarning(){
    // Fetch colony list element and number of selected colonies
    var colony_list = document.getElementById("colony-list")
    var current_colonies = colony_list.querySelectorAll(".colony-container").length;

    // Update the style of the container depending if any of the colonies is selected
    colony_list.style.display = current_colonies == 0 ? "none" : "block";

    // Get the number of players playing
    var players = parseInt(document.getElementById("player-number").value);


    // Set the expected players value
    var expected_colonies = 5;
    if(players != 2){
        expected_colonies = players + 2;
    }

    // Add the exception for Aridor
    var colonies_in_play = Array.from(document.getElementsByClassName("player-colony-select")).map(function(elem){return elem.value;});
    if (colonies_in_play.includes("Aridor")){
        expected_colonies += 1;
    }

    // Set warning if necessary
    var warning = document.getElementById("colony-warning")

    if (expected_colonies != current_colonies){
        
        warning.innerHTML = 
        `WARNING! Wrong number of colonies, ${expected_colonies} expected!`
        warning.style.display = 'block'
    }
    else{
        warning.style.display = 'none'
    }
}

//////////////////////
//    CHECKBOXES
//////////////////////


//Updates the list of colonies when a checkbox is clicked
window.checkboxFunction = function (elem){

    //Gets colony
    var colony = getElementInsideContainer("colony-list", elem.value + '-icon');
    var div_list = document.getElementById("colony-list");

    if (elem.checked && colony == false){
        //Get colony name
        var colony_name = elem.value;
        // Add colony to the colony list
        div_list.innerHTML += 
        `
        <div class="colony-container" id="${colony_name}-icon" onclick="increaseColonyNumber(this)">
            <img src="resources/icons/colonies/${colony_name}.png" class="colony-icon">
            <input type="hidden" value="0">
            <div class="colony-text">
                ${capitalize(colony_name)}<br>(0)
            </div>
        </div>
        `;
    } else if(!elem.checked && colony != false){
        // If enement is unchecked and colony exists remove it
        colony.remove();
    }

    // Updates warning
    updateWarning();
}

// Hides the given checkbox container
window.hideCheckboxContainer = function (elem, checkbox_container){
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

///////////////
//    DATE
///////////////

//Sets the default date
function setDefaultDate(){
    var today = new Date();
    const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const [{ value: month },,{ value: day },,{ value: year }] = dateTimeFormat .formatToParts(today);
    document.getElementById("datepicker").value = `${year}-${month}-${day}`;
}

setDefaultDate()

/////////////////////
//     PLAYERS
/////////////////////

//Generates player input fields
window.generatePlayerInputs = function (){
    // Fetch number of players
    var number_of_players_input = document.getElementById("player-number");
    // Check and update the range
    if (number_of_players_input.value > 5)
        number_of_players_input.value = 5;
    else if (number_of_players_input.value < 1)
             number_of_players_input.value = 1;

    // Fetch number of players and player input list
    var players = number_of_players_input.value;
    var players_list = document.getElementById("player-list");


    // Create input fields
    players_list.innerHTML = 
    `
    <div class="player-input-div">
        <input list="datalist-players" class="player-input" id="player">
        <select class="player-input corporation-select" name="player-colony">
        </select>
    </div>
    `.repeat(players);
    
    // Update warning
    updateWarning();

    // Set players input list to visible
    players_list.style.display = "block"
    document.getElementById("base-option-generate").style.display = "block";
}

generatePlayerInputs();

// Set the listener to listen to enter key presses
var number_of_players_input = document.getElementById("player-number");
number_of_players_input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        generatePlayerInputs();
    }
});


// Loads players and corporations from database and adds them to the datalist
async function addExternData(){
    const octokit = new Octokit();
    //Fetch file from git
    var data = await getFile("data/data.json", octokit);
    //Decode base64 file content and parse json
    var data = JSON.parse(b64_to_utf8(data.data.content));

    //Add names
    var names = data.player_names;
    //Create datalist for HTML
    var datalist = names.map(function(name){return `<option value="${name}">`}).join('\n');
    document.getElementById("datalist-players").innerHTML = datalist;

    //Add colonies
    var corporations = data.corporation_names;
    corporations.sort();
    var corporation_list = corporations.map(corp => `<option value="${corp}">${corp}</option>`).join("\n");
    Array.from(document.getElementsByClassName("corporation-select"))
        .forEach(elem => elem.innerHTML = corporation_list);
}

addExternData();

//////////////////////
//     COLONIES
//////////////////////

// Activates colonies expansion
window.activateColonies = function (elem){
    // Fetches the colonies option field
    var colony_options = document.getElementById("colonies-options");
    colony_options.style.display = elem.checked ? "block" : "none";
}

// Increases the colony counter text by one in modulo 4 arithmetic
window.increaseColonyNumber = function (elem){
    // Gets the name of the colony
    var colony = elem.id.substring(0, elem.id.length - 5);

    // Gets the current number of colonies on a moon
    var current_colonies = elem.querySelector("input");
    current_colonies.value = (parseInt(current_colonies.value) + 1) % 4;

    // Gets the text div element of elem
    var text = elem.querySelector("div");
    text.innerHTML = `${capitalize(colony)}<br>(${current_colonies.value})`
}

//////////////////
//     TABLE
//////////////////

// Updates totals and ranks
window.updateTotals = function(){
    // Define keys of scores that are tracked
    var categories = [
        "tr-points",
        "award-points",
        "milestone-points",
        "greenery-points",
        "city-points",
        "card-points",
        "gold-lead-points"]

    // Case turmoil is in game
    if (getActiveModes().includes("Turmoil")){
        categories.push("turmoil-points")
    }

    // Fetch number of players
    var no_players = parseInt(document.getElementById("player-number").value);
    // Init scores
    var scores = new Array(no_players).fill(0);
    // Calculate totals, iterating over all scores
    categories.forEach(
        function(key){
            // Get all points from the category defined by the category key
            var points = document.getElementById(key).querySelectorAll("input");
            for(var i = 0; i < no_players; ++i){
                // Try parsing the key, in case it is not a number, ignore 
                var value = parseInt(points[i].value);
                if(!isNaN(value)){
                    scores[i] += value;
                }
            }
        }
    );

    // Update totals
    var totals = document
        .getElementById("total-points")
        .querySelectorAll("input");

    for (var i = 0; i < no_players; ++i){
        totals[i].value = scores[i];
    }

    // Define Decorate-Sort-Undecorate
    const dsu = (arr1, arr2) => arr1
        .map((item, index) => [arr2[index], item]) 
        .sort(([arg1], [arg2]) => arg2 - arg1) 
        .map(([, item]) => item);

    // Create arranged array, and calculate indexes
    const iota = Array.from(Array(no_players).keys());
    const result = dsu(iota, scores);

    // Update ranks
    var ranks = document
        .getElementById("ranks")
        .querySelectorAll("input");

    for (var i = 0; i < no_players; ++i){
        ranks[result[i]].value = i + 1;
    }
}

// Generates the point table for the scores
window.generatePointTable = function(){
    // Gets the points div, points table and player list nodes
    var points_div = document.getElementById("points");
    var table = document.getElementById("points-table");
    var player_list = document.getElementById("player-list");

    // Fetches the names of the players
    var player_names = Array.from(player_list.children).map(
        function(element) { return element.children[0].value; }
    );

    // Creates the name row for the table
    var name_row = 
    `<tr id="player-names">
        <td class="table-cell">Name</td>
        ${player_names.map(element => `<td class="table-cell">${element}</td>`).join("\n")}
    </tr>`;

    // Constant value for the score categories
    var categories = [
        ["TR", "tr-points"], 
        ["Awards", "award-points"], 
        ["Milestones", "milestone-points"], 
        ["Greenery", "greenery-points"], 
        ["Cities", "city-points"], 
        ["Cards", "card-points"],
        ["Gold lead", "gold-lead-points"]];

    // Inserts turmoil before gold lead
    if (getActiveModes().includes("Turmoil")){
        categories.splice(categories.length - 1, 0, ["Turmoil", "turmoil-points"]);
    }

    // Creates the inputs for the scores
    var createInputs = (type, additional = "") => `<td class="table-cell"><input class="table-input" type="${type}" ${additional}></td>`.repeat(player_names.length);

    // Adds all point rows
    var points = categories.map( option =>
    `<tr id="${option[1]}">
        <td class="table-cell">${option[0]}</td>
        ${createInputs("number", 'onchange="updateTotals()"')}
    </tr>
    `)

    // Adds total points rows
    var total_points = 
        `<tr id="total-points">
            <td class="table-cell">Total</td>
            ${createInputs("text", 'value="0" disabled')}
        </tr>`

    // Adds ranks rows
    var ranks = 
        `<tr id="ranks">
            <td class="table-cell">Rank</td>
            ${createInputs("text", 'value="1" disabled')}
        </tr>`

    // Adds possibility for notes
    var note_input = 
        `<tr id="player-note">
            <td class="table-cell">Notes</td>
            ${createInputs("text")}
        </tr>`
    
    // Creates the table and sets the style to visible
    table.innerHTML = name_row + points.join('\n') + total_points + ranks + note_input;

    // Update display of gold lead
    goldLeadFunction();
    
    // Show points div
    points_div.style.display = 'block'
}

// Update the visibility of the gold lead field
window.goldLeadFunction = function(){
    var gold_lead = document.getElementById("gold-lead-input").checked;
    document.getElementById("gold-lead-points").style.display = gold_lead ? "" : "none";
}

//////////////////
//     SUBMIT
//////////////////

function createCode(modes){
    var mode_dict = {
        "Base": "B",
        "Corporate Era": "CE",
        "Prelude": "Pr",
        "Colonies": "Col",
        "Draft": "Dr",
        "Venus": "Ve",
        "Turmoil": "Tu",
    }
    return modes.map( mode => mode_dict[mode]).join("+");
}

window.submitForm = async function(){

    const password_hash = "2127c97b1c21f675c8ea7c47ce5fffb827b15035aea988e525ab8a24fd8ad6d0"
    var password = document.getElementById("password-field").value;

    if (CryptoJS.SHA256(password).toString() != password_hash){
        var banner = document.getElementById("game-added-banner");
        banner.innerHTML = "Wrong password!";
        banner.style.backgroundColor = "black";
        banner.style.color = "white";
        banner.style.display = "block";
        return;
    }

    // Get GitHub api token by decrypting encrypted token
    const encrypted_token = "U2FsdGVkX1+n1ehJgHqx60l9tKl1nu1zx0MlMiCXO+YDPnIW/5I0+1JboKey3qjNMo10biUocmSAMHrD0bwJ8Q==";
    var decrypted = CryptoJS.AES.decrypt(encrypted_token, password);

    // Init Octokit
    const octokit = new Octokit({auth: decrypted.toString(CryptoJS.enc.Utf8)});


    // Fetch global values
    var name = document.getElementById("name-input").value;
    var note = document.getElementById("game-notes").value;
    var date = document.getElementById("datepicker").value;

    var mode = getActiveModes()
    var mode_code = createCode(mode);

    var map = "Tharsis"
    var no_players = parseInt(document.getElementById("player-number").value);
    var generations = parseInt(document.getElementById("generations").value);

    // Fetch player specific inputs
    var players = Array.from(document.getElementsByClassName("player-input-div"))
        .map(function(elem){
            return {name: elem.children[0].value, corporation: elem.children[1].value}
        });

    var categories = [
        ["tr-points", "tr"],
        ["award-points", "awards"],
        ["milestone-points", "milestones"],
        ["greenery-points", "greenery"],
        ["city-points", "cities"],
        ["card-points", "cards"],
        ["gold-lead-points", "lead"],
        ["total-points", "total"],
        ["ranks", "rank"],
        ["player-note", "note"],
    ]

    if (mode.includes("Turmoil")){
        categories.push(["turmoil-points", "turmoil"])
    }

    // Iterate over the categories and add them to player stats
    categories.forEach(
        function(elem){
            var key = elem[0];
            var category = elem[1];
            var points = document
                .getElementById(key)
                .querySelectorAll("input");

            for(var i = 0; i < no_players; ++i){
                //Points vs note in the end
                players[i][category] = 
                    category != "note" ? 
                    parseInt(points[i].value) : points[i].value;
            }
        }
    )

    var winner = players.filter(player => player.rank == 1);

    var entry = {
        name: name,
        note: note,
        date: date,
        mode: mode,
        mode_code: mode_code,
        map: map,
        winner: winner.name,
        win_corp: winner.corporation,
        win_score: winner.total,
        players: no_players,
        generation: generations,
        scores: players
    }

    // Add colonies
    if(mode.includes("Colonies")){
        var colonies = document.getElementsByClassName("colony-container");
        colonies = Array.from(colonies).map(function(entry){
                    return {
                        name: entry.children[2].childNodes[0].nodeValue.trim(),
                        count: entry.children[1].value
                    }
                }
            );
        entry.colonies = colonies;
    }

    // Add all players to the database
    var data = await getFile("data/log.json", octokit);
    var log = JSON.parse(b64_to_utf8(data.data.content));
    data = await getFile("data/data.json", octokit);
    var player_data = JSON.parse(b64_to_utf8(data.data.content));
    data = await getFile("data/games.json", octokit);
    var games_data = JSON.parse(b64_to_utf8(data.data.content));
    
    // Add redundant log
    log.push(
        {
            action: "Added game entry",
            date: new Date(),
            data: entry
        }
    );

    // Add game
    games_data.push(entry);

    // Add players

    var player_names = Array.from(document.getElementsByClassName("player-input-div"))
        .map( elem => elem.children[0].value);

    player_names.forEach(function (name){
        if (!player_data.player_names.includes(name)){
            player_data.player_names.push(name);
        }
    });

    // Push files
    await updateFile(JSON.stringify(log, null, 2), "data/log.json", `Added game "${name}"`, octokit);
    await updateFile(JSON.stringify(player_data, null, 2), "data/data.json", `Added game "${name}"`, octokit);
    await updateFile(JSON.stringify(games_data, null, 2), "data/games.json", `Added game "${name}"`, octokit);

    document.getElementById("password-field").value = "";

    var banner = document.getElementById("game-added-banner");
    banner.innerHTML = "Game added!";
    banner.style.backgroundColor = "rgb(240, 240, 240)";
    banner.style.color = "black";
    banner.style.display = "block";

    console.log(entry);
}

//Used to update the encrypted token in function above
function encryptToken(token, password){
    var encrypted = CryptoJS.AES.encrypt(token, password)
    print(encrypted.toString())
}


//Add listener to password field
var password_field = document.getElementById("password-field");
password_field.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        submitForm();
    }
});