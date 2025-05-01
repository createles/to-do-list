let projects = []; // initialize projects array to store project objects
let currentProjId = 0; // initialize id number of projects

function loadProjects() {
    const storedProjects = localStorage.getItem('projects');

    // if storedProjects exists
    if (storedProjects) {
        try {
            projects = JSON.parse(storedProjects);

            // maxId = accumulator, p = project. 
            // Math.max chooses the bigger number between maxId and p.id;
            // maxId starts with -1, and compares it to the first available objects id,
            // which is always greater than -1. After running the reduce method on every item,
            // returns the final value of maxId and sets currentProjId to that number
            currentProjId = projects.reduce((maxId, p) => Math.max(maxId, p.id), -1) + 1;
        } catch (e) {
            console.error("Could not parse projects from localStorage", e);
            projects = [];
            currentProjId = 0;
        }
    }
}

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
function selectProjectById(projectId) {
    const project = projects.find(p => p.id === projectId);
    return project ? {...project} : null; // once again, return a new object that is a shallow copy of the project object
    // return null if not found
}

function removeProject(projectId) {
    projects = projects.filter(p => p.id !== projectId); // filter out the project from array
    saveProjects();
}

export {loadProjects, newProject, getAllProjects, selectProjectById, removeProject};