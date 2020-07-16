
function hideCheckboxContainer(elem){
    var x = document.getElementById("checkbox-container");
    if (x.style.display === "none") {
        x.style.display = "block";
        elem.value = "Hide"
    } else {
        x.style.display = "none";
        elem.value = "Unhide"
    }
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

function checkboxFunction(elem){
    var colony = getElementInsideContainer("colony-list", elem.value)
    div_list = document.getElementById("colony-list")

    if (elem.checked && colony == false){
        colony_name = elem.value
        div_list.innerHTML += 
            `<div class="colony-container" id="${colony_name}">
                <img src="resources/icons/colonies/${colony_name}.png" class="colony-icon">
                <div class="colony-overlay">
                <div class="colony-text">${colony_name.charAt(0).toUpperCase() + colony_name.slice(1)}</div>
                </div>
            </div>
            `
    } else if(!elem.checked && colony != false){
        colony.remove();
    }

    current_colonies = div_list.querySelectorAll(".colony-container").length
}

