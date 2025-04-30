let projects = []; // initialize projects array to store project objects
let currentProjId = 0; // initialize id number of projects

function newProject(title = "New Project") { // set default value for title if missing
    const newProject = {
        id: currentProjId++, // post increment operator; set id to current value, then increment the variable in one move
        title: title
    };

    projects.push(newProject);
    saveProjects(); // Save to local storage after creation
    return { ...newProject}; // returns shallow object; basically replica of the object
    // for use in the main index.js 
}

// Save to local storage
function saveProjects() {
    localStorage.setItem('projects', JSON.stringify(projects));
}

// Passes the projects array to index.js
function getAllProjects() {
    return [...projects]; // returns a shallow copy of the projects array to the main index.js
}

// implement a function to SELECT a proj for project-template to use
// function selectProjectById() {

// }


export {newProject, getAllProjects};