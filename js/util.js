window.utf8_to_b64 = function(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}

window.b64_to_utf8 = function(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

//Capitalizes given string
window.capitalize = function(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Gets the child of a parent
// If the child doesnt exist in the parent node, returns false
window.getElementInsideContainer = function(containerID, childID) {
    var elm = document.getElementById(childID);
    var parent = elm ? elm.parentNode : {};
    return (parent.id && parent.id === containerID) ? elm : false;
}

//////////////
//    GIT
//////////////
window.owner = 'ChocolateChipKookie';
window.repo = "chocolatechipkookie.github.io";

//Loads git file
window.getFile = async function(filepath, octokit){
    return octokit.request(`GET https://api.github.com/repos/${owner}/${repo}/contents/${filepath}`);
}

//Checks if git file exists
window.checkFile = async function(filepath, octokit){
    try {
        await octokit.repos.getContents({
            method: 'HEAD',
            owner,
            repo,
            path
        });
        return true;
    } catch (error) {
        if (error.status === 404) {
            return false;
        } else {
            throw error;
        }
    }

}

//Updates git file
window.updateFile = async function(content, filepath, message='', octokit){
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

//Create git file
window.createFile = async function(content, filepath, message='', octokit){
    const response = await octokit.request(`PUT https://api.github.com/repos/${owner}/${repo}/contents/${filepath}`,
    {
        owner: owner,
        repo: repo,
        path: filepath,
        message: message,
        content: utf8_to_b64(content),
    });
    return response;
}
