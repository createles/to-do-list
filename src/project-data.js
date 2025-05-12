let projects = []; // initialize projects array to store project objects
let currentProjId = 0; // initialize id number of projects

function loadProjects() {
    const storedProjects = localStorage.getItem('projects');

    // if storedProjects exists
    if (storedProjects) {
        try {
            projects = JSON.parse(storedProjects);
            // Backwards compatibility check for old projects intialized without tasks array
            projects.forEach(project => {
                if (!project.tasks) {
                    project.tasks = [];
                }
            })
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
        title: title,
        tasks: []
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
    return projects.map(project => ({
        ...project,
        tasks: [...project.tasks]        
    })); // returns a shallow copy of the projects and their tasks array
}

// implement a function to SELECT a proj for project-template to use
function selectProjectById(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        return {...project, tasks: [...project.tasks]};
    }
    // return null if not found
    return null; 
}

function removeProject(projectId) {
    projects = projects.filter(p => p.id !== projectId); // filter out the project from array
    saveProjects();
}

function updateProject(projectId, updates) {
    const projectIndex = projects.findIndex(p => p.id === projectId);

    // if the project doesn't exist
    if (projectIndex === -1) {
        console.error(`Project with ID ${projectId} was not found.`);
        return false;
    }

    // get project at projectIndex and
    // replace it with a new object
    // new object first copies all key/values of original object
    // then overwrites those values with any changes in the update object
    projects[projectIndex] = { ...projects[projectIndex], ...updates};    

    saveProjects();
    return true; // for successs indication
}

export {loadProjects, newProject, getAllProjects, selectProjectById, removeProject, updateProject};