let projects = []; // initialize projects array to store project objects
let currentProjId = 0; // initialize id number of projects

function loadProjects() {
    const storedProjects = localStorage.getItem('projects');
    console.log("Loading projects...");

    // if storedProjects exists
    if (storedProjects) {
        try {
            let parsedProjects = JSON.parse(storedProjects);
            console.log("Parsed from local storage:", parsedProjects);

            // Iterate over projects and ensure task structure and defaults
            projects = parsedProjects.map(project => {

                // Backwards compatibility check for old projects intialized without tasks array
                const tasksArray = (project.tasks && Array.isArray(project.tasks))
                    ? project.tasks : []; // if project.tasks exists and is an array, return it

                // NORMALIZES each task to be an object with the required fields
                // catches any errors in saving task objects to ensure absolute formatting
                const normalizedTasks = tasksArray.map((tasks, index) => {
                    if (typeof task === "object" && tasks !== null) {
                        return {
                            id: task.id || `task_${project.id || 'proj'}_${index}_${Date.now()}`, // Robust measures to secure task ID
                            text: task.text || "", // Empty string if no text included
                            completed: typeof task.completed === "boolean" ? task.completed : false, // Default to false
                            priority: typeof task.priority === "number" ? task.priority : 0, // Default priority set to 0
                            dueDate: task.dueDate || null // Defaults to null
                        };
                    }
                });

                return { ...project, tasks: normalizedTasks };
            });

            console.log("Projects after normalization:", projects);

            if (projects.length > 0) {
                const maxId = projects.reduce((currentMax, p) => {
                    const pId = (typeof p.id === "number" && !isNaN(p.id)) ? p.id : -1;
                    return Math.max(currentMax, pId);
                }, -1);
                currentProjId = maxId >= 0 ? maxId + 1 : 0;
            } else {
                currentProjId = 0;
            }
            console.log("currentProjId set to:", currentProjId);

        } catch (e) {
            console.error("Could not parse projects from localStorage", e);
            projects = [];
            currentProjId = 0;
        }
    } else {
        // No 'projects' key in localStorage (e.g., first-time use)
        console.log("No projects found in localStorage. Initializing empty.");
        projects = [];
        currentProjId = 0;
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

// **MODIFY DEBUGGING FUNCTION**
function logAllProjects() {
    console.log("--- Current Projects in Memory ---");

    if (!projects || projects.length === 0) {
        const rawLocalStorage = localStorage.getItem('projects');
        if (rawLocalStorage && rawLocalStorage !== "[]") {
            console.log("The 'projects' array in memory is empty, but localStorage seems to have data.");
            console.log("Did loadProjects() run on app initialization?");
            console.log("Raw localStorage content:", rawLocalStorage);
        } else {
            console.log("No projects found in memory (and localStorage might be empty or uninitialized).");
        }
        console.log("--- End of Log ---");
        return;
    }

    console.log(`Found ${projects.length} project(s):`);
    // console.table() provides a nice tabular format for arrays of objects
    console.table(projects.map(p => ({...p}))); // Logging a shallow copy of each project for clarity

    console.log("--- End of Log ---");
}

// debugging purposes
if (typeof window !== 'undefined') {
    window.dev_logAllProjects = logAllProjects;
}

export {loadProjects, newProject, getAllProjects, selectProjectById, removeProject, updateProject, logAllProjects};