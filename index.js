
///////////////
//    UTIL
///////////////

function capitalize(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getElementInsideContainer(containerID, childID) {
    var elm = document.getElementById(childID);
    var parent = elm ? elm.parentNode : {};
    return (parent.id && parent.id === containerID) ? elm : false;
}

function elementExists(elem, parent){
    var element = parent.querry(elem);
    return typeof(element) != 'undefined' && element != null;
}


////////////////////
//     WARNING
////////////////////

function updateWarning(){
    var current_colonies = document.getElementById("colony-list").querySelectorAll(".colony-container").length;
    var players = parseInt(document.getElementById("player-number").value);
    var expected_colonies = 5;
    if(players != 2){
        expected_colonies = players + 2;
    }

    var warning = document.getElementById("colony-warning")
    if (current_colonies == 0){
        provjeriti ovo!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        current_colonies.style.display = "none"
    }
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

function checkboxFunction(elem){
    var colony = getElementInsideContainer("colony-list", elem.value + '-icon');
    var div_list = document.getElementById("colony-list");

    if (elem.checked && colony == false){
        var colony_name = elem.value;
        div_list.innerHTML += 
        `
        <div class="colony-container" id="${colony_name}-icon" onclick="increaseColonyNumber(this)">
            <img src="resources/icons/colonies/${colony_name}.png" class="colony-icon">
            <input type="hidden" id="variable-number" value="0">
            <div class="colony-text">
                ${capitalize(colony_name)}<br>(0)
            </div>
        </div>
        `;
    } else if(!elem.checked && colony != false){
        colony.remove();
    }

    updateWarning();
}

function hideCheckboxContainer(elem, checkbox_container){
    var x = document.getElementById(checkbox_container);
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


function generatePlayerInputs(){
    var number_of_players_input = document.getElementById("player-number");
    if (number_of_players_input.value > 5)
        number_of_players_input.value = 5;
    else if (number_of_players_input.value < 1)
             number_of_players_input.value = 1;

    var players = number_of_players_input.value;
    var players_list = document.getElementById("player-list");
    
    players_list.innerHTML = 
    `
    <div class="player-input-div">
        <input list="datalist-players" class="player-input" id="player">
        <select class="player-input" id="player-colony-select" name="player-colony">
            <option value="Aridor/">Aridor</option>
            <option value="Arklight">Arklight</option>
            <option value="Beginner">Beginner</option>
            <option value="Cheung Shing Mars">Cheung Shing Mars</option>
            <option value="Credicor">Credicor</option>
            <option value="Ecoline">Ecoline</option>
            <option value="Helion">Helion</option>
            <option value="Interplaneraty Cinematics">Interplaneraty Cinematics</option>
            <option value="Inventrix">Inventrix</option>
            <option value="Mining Guild">Mining Guild</option>
            <option value="Phobolog">Phobolog</option>
            <option value="Point Luna">Point Luna</option>
            <option value="Polyphemos">Polyphemos</option>
            <option value="Poseidon">Poseidon</option>
            <option value="Robinson Industries">Robinson Industries</option>
            <option value="Saturn Systems">Saturn Systems</option>
            <option value="Stormcraft Incorporated">Stormcraft Incorporated</option>
            <option value="Teractor">Teractor</option>
            <option value="Tharsis Republic">Tharsis Republic</option>
            <option value="Thorgate">Thorgate</option>
            <option value="UNMI">UNMI</option>
            <option value="Valley Trust">Valley Trust</option>
            <option value="Vitor">Vitor<option>
        </select>
    </div>
    `.repeat(players);
    

    updateWarning();

    players_list.style.display = "block"
    document.getElementById("base-option-generate").style.display = "block";
}

generatePlayerInputs();

var number_of_players_input = document.getElementById("player-number");
number_of_players_input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("generate-player-inputs").click();
  }
}); 


function addDefaultPlayers(){
    var datalist = document.getElementById("datalist-players").innerHTML = 
    `
        <option value="Dolores Frančišković">
        <option value="Vito Papa">
        <option value="Adi Čaušević">
        <option value="Mia Čaušević">
        <option value="Matteo Samsa">
        <option value="Jan Mastrović">
    `;
}

addDefaultPlayers();


//////////////////////
//     COLONIES
//////////////////////


function activateColonies(elem){
    var colony_options = document.getElementById("colonies-options");
    if (elem.checked){
        colony_options.style.display = "block"
    } 
    else{
        colony_options.style.display = "none"
    }
    current_colonies = div_list.querySelectorAll(".colony-container").length
}

function increaseColonyNumber(elem){
    var text = elem.querySelector("div");
    var colony = elem.id.substring(0, elem.id.length - 5);
    var current_colonies = elem.querySelector("#variable-number");

    current_colonies.value = (parseInt(current_colonies.value) + 1) % 4;

    text.innerHTML = `${capitalize(colony)}<br>(${current_colonies.value})`
}


//////////////////
//     TABLE
//////////////////

function generatePointTable(){
    var points_div = document.getElementById("points");
    var table = document.getElementById("points-table");
    var player_list = document.getElementById("player-list");

    player_names = Array.from(player_list.children).map(
        function(element) { return element.children[0].value; }
    );

    var name_row = 
    `<tr id="player-names">
        <td class="table-cell">Name</td>
        ${player_names.map(element => `<td class="table-cell">${element}</td>`).join("\n")}
    </tr>`;

    const categories = [
        ["TR", "tr-points"], 
        ["Awards", "award-points"], 
        ["Milestones", "milestone-points"], 
        ["Greenery", "greenery-points"], 
        ["Cities", "city-points"], 
        ["Cards", "card-points"]]

    var inputs = `<td class="table-cell"><input class="table-input" type="number"></td>`.repeat(player_names.length)

    var points = categories.map( option =>
    `<tr id="${option[1]}">
        <td class="table-cell">${option[0]}</td>
        ${inputs}
    </tr>
    `)

    table.innerHTML = name_row + points.join('\n');

    points_div.style.display = 'block'
}