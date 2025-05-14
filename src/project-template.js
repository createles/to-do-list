import { showModal, openModalForNewProj } from "./modal-ui";
import { getAllProjects } from "./project-data";


function loadApp() {
    renderAllProjectCards(); 
}

function createAddButton() {
    const addButton = document.createElement("button");
    addButton.classList.add("addButton");
    addButton.textContent = "+";
    addButton.addEventListener("click", openModalForNewProj);
    return addButton;
}

function renderAllProjectCards() {
    const projFolder = document.querySelector("#projectFolder")
    if (!projFolder) {
        console.error("Project folder container (#projectFolder) not found.");
        return;
    }

    // clear all project cards from folder
    projFolder.innerHTML = '';

    // get all projects
    const allProjects = getAllProjects();

    if (allProjects && allProjects.length > 0) {
        allProjects.forEach(projItem => {
            renderProjectCard(projItem);
        });
    } else {
        const centerButton = createAddButton();
        centerButton.id = "centerButton";
        const caption = document.createElement("p");
        caption.textContent = "Add your first to-do-note!"
        centerButton.insertBefore(caption, centerButton.firstChild);
        projFolder.append(centerButton);
    }
}

function renderProjectCard(projItem) {
    // for labeling the project card
    const projTitle = projItem.title;
    // for use in selecting, updating, or deleting proj details
    const projId = projItem.id;
    // create a shallow copy of the project's task array
    const tasks = [...projItem.tasks];

    const projFolder = document.querySelector("#projectFolder");

    if (!projFolder) {
        console.error("Project folder container (#projectFolder) not found.");
        return;
    }

    const projectCard = document.createElement("div");
    projectCard.classList.add("projectCard");

    // attach identifier to the projCard using it's ID
    projectCard.dataset.projectId = projId;

    const cardTitle = document.createElement("p");
    cardTitle.classList.add("projectCardTitle");
    cardTitle.textContent = projTitle;

    const taskList = document.createElement("div");
    taskList.classList.add("projectCardTaskList");

    // if tasks exist, create task items
    if (tasks.length > 0) {
        tasks.forEach((taskText, index) => {
            const projCardTaskRow = document.createElement("div");
            projCardTaskRow.classList.add("projectCardTaskRow");

            const checkBox = document.createElement("input")
            checkBox.type = "checkbox";
            checkBox.classList.add("projectCardCheckbox");
            checkBox.id = `${projId}-task-${index}`; // assign id per task

            // TODO: If tasks become objects with a 'completed' status, set checkBox.checked here.
            // For now, they will all be unchecked by default as tasks are strings.

            const taskContent = document.createElement("p");
            taskContent.classList.add("projectCardTaskContent");
            taskContent.textContent = taskText;

            // create label and wrap tasks in a label to associate with checkbox
            const taskLabel = document.createElement("label");
            // attaches label to checkbox
            taskLabel.htmlFor = checkBox.id;
            // insert <p> into label
            taskLabel.append(taskContent);

            projCardTaskRow.append(checkBox, taskLabel);
            taskList.append(projCardTaskRow);
        });
    } else { // If no tasks are found, display message
        const noTasksMessage = document.createElement("p");
        noTasksMessage.classList.add("noTasksMessage");
        noTasksMessage.textContent = "No current tasks available."
        taskList.append(noTasksMessage);
    }
    

    projectCard.append(cardTitle, taskList);
    projFolder.append(projectCard);
}

export {loadApp, renderProjectCard, renderAllProjectCards}