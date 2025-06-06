import { showModal, openModalForNewProj, openModalForExistingProject } from "./modal-ui";
import { getAllProjects, removeProject, selectProjectById, updateProject } from "./project-data";

const addButtonHome = document.querySelector(".addButtonHome");

function loadApp() {
    renderAllProjectCards(); 
}

// creates generic button to add more projects
function createAddButton() {
    const addButton = document.createElement("button");
    addButton.classList.add("addButton");
    addButton.textContent = "+";
    addButton.addEventListener("click", openModalForNewProj);
    return addButton;
}

// creates the centerButton for adding first project
function createCenterButton() {
    const centerButton = createAddButton();
    centerButton.id = "centerButton";
    const caption = document.createElement("p");
    caption.textContent = "Add your first to-do-note!"
    centerButton.insertBefore(caption, centerButton.firstChild);
    return centerButton;
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

    // displays all projects onto the DOM
    if (allProjects && allProjects.length > 0) {
        allProjects.forEach(projItem => {
            renderProjectCard(projItem);
        });
        const addButton = createAddButton();
        projFolder.prepend(addButton);
    } else {
        const centerButton = createCenterButton();
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

    // Groups tasks according to their completion status to handle ordering
    // in the taskList container
    const incompleteTasksFragment = document.createDocumentFragment();
    const completedTasksFragment = document.createDocumentFragment();

    // if tasks exist, create task items
    if (tasks && tasks.length > 0) {
        tasks.forEach((task, index) => {
            const projCardTaskRow = document.createElement("div");
            projCardTaskRow.classList.add("projectCardTaskRow");
            
            // stops the click on items in the task area from bubbling up and triggering
            // the openModal behavior on projCard
            projCardTaskRow.addEventListener("click", (event) => {
                event.stopPropagation();
            })

            const checkBox = document.createElement("input")
            checkBox.type = "checkbox";
            checkBox.classList.add("projectCardCheckbox");
            checkBox.id = `${projId}-task-${index}`; // assign id per task
            checkBox.checked = task.completed;

            // Updates the project-data to reflect change in checked status
            checkBox.addEventListener("change", (event) => {
                event.stopPropagation();

                // this sets the checked state by checking the checked property of the checkBox
                const currentCheckedState = event.target.checked;
                const currentTaskId = task.id; 
                const currentProjId = projId;

                console.log(`Task ${currentTaskId} in project ${currentProjId} completion status: ${currentCheckedState}`);

                const projectToUpdate = selectProjectById(currentProjId); // selects the proj to update
                if (projectToUpdate) {
                    const taskToUpdate = projectToUpdate.tasks.find(t => t.id === currentTaskId);
                    if (taskToUpdate) {
                        taskToUpdate.completed = currentCheckedState;
                        updateProject(currentProjId, { tasks: projectToUpdate.tasks })
                        renderAllProjectCards();
                        populateQuickCards();
                    } else {
                        console.error("Task to update not found in the project's task folder.")
                    }
                } else {
                    console.error("Project to update not found in projects folder.");
                }
            })

            const taskContent = document.createElement("p");
            taskContent.classList.add("projectCardTaskContent");
            taskContent.textContent = task.text;

            // create label and wrap tasks in a label to associate with checkbox
            const taskLabel = document.createElement("label");
            // attaches label to checkbox
            taskLabel.htmlFor = checkBox.id;
            // insert <p> into label
            taskLabel.append(taskContent);

            // applies strike-through styling to task upon completion
            if (task.completed) {
                taskContent.classList.add("completed");
            } else {
                taskContent.classList.remove("completed");
            }

            // Append the checkbox and label "p" to the taskRow to build the task item
            projCardTaskRow.append(checkBox, taskLabel);

            // Handle ordering the tasks based on completion
            if (task.completed) {
                completedTasksFragment.appendChild(projCardTaskRow);
            } else {
                incompleteTasksFragment.appendChild(projCardTaskRow);
            }

        });

        // appends the taskRows AFTER looping through all tasks
        // adds incompleted tasks first, then completed tasks
        taskList.appendChild(incompleteTasksFragment);
        taskList.appendChild(completedTasksFragment);

    } else { // If no tasks are found, display message
        const noTasksMessage = document.createElement("p");
        noTasksMessage.classList.add("noTasksMessage");
        noTasksMessage.textContent = "No current tasks available."
        taskList.append(noTasksMessage);
    }

    // create trash button
    const trashButton = document.createElement("button");
    trashButton.classList.add("trashButton");
    trashButton.innerHTML = "&#128465;";

    // add event listener to delete project card on click
    trashButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent click from bubbling up to projectCard
        // add confirm dialog option
        if (confirm(`Are you sure you want to delete the project "${projTitle}"?`)) {
            projectCard.remove();
            // delete from storage
            removeProject(projId);

            console.log(`Project "${projTitle}" (ID: ${projId}) has been deleted.`);

            renderAllProjectCards(); // refresh projFolder
            populateQuickCards(); // refresh the quick cards
        }
    });

    // Open modal for the project card on click
    projectCard.addEventListener("click", () => {
        openModalForExistingProject(projId);
    });

    projectCard.append(cardTitle, taskList, trashButton);
    projFolder.append(projectCard);
}

if (addButtonHome) {

    // hides home add button on click and
    // opens a new modal to create a project
    addButtonHome.addEventListener("click", () => {
        addButtonHome.classList.remove("isVisible");
        openModalForNewProj();
    });

    // listens in for modalHasOpened custom event to hide the button
    // when modal is opened some other way (existing proj card was clicked)
    document.addEventListener('modalHasOpened', () => {
        console.log("modalHasOpened event received.");
        if (addButtonHome) {
            addButtonHome.classList.remove("isVisible");
        }
    })

    // makes button visible again when modal closes
    document.addEventListener('modalHasClosed', () => {
        console.log("modalHasClosed event received.");
        if (addButtonHome) {
            addButtonHome.classList.add("isVisible");
        }
    });

} else {
    console.error("Add project button not found in the DOM.");
}


function createQuickRowElement(taskObject, projectId) {
    const quickTaskRow = document.createElement("div");
    quickTaskRow.classList.add("quickTaskRow");

    quickTaskRow.dataset.taskId = taskObject.id;
    quickTaskRow.dataset.projectId = projectId;

    quickTaskRow.addEventListener("click", (event) => {
        event.stopPropagation(); // If these rows are inside something else clickable
    });

    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.classList.add("quickTaskCheckBox"); // Specific class for styling
    checkBox.id = `quickcard-proj${projectId}-task${taskObject.id}`;
    checkBox.checked = taskObject.completed;

    checkBox.addEventListener("change", (event) => {
        event.stopPropagation();
        const currentCheckedState = event.target.checked;
        // Data update logic
        const projectToUpdate = selectProjectById(projectId); // Ensure selectProjectById is available
        if (projectToUpdate) {
            const taskToUpdate = projectToUpdate.tasks.find(t => t.id === taskObject.id);
            if (taskToUpdate) {
                taskToUpdate.completed = currentCheckedState;
                updateProject(projectId, { tasks: projectToUpdate.tasks }); 
                
                
                populateQuickCards(); // This will re-sort and re-render the quick cards
                renderAllProjectCards(); // update the main project list
            }
        }
    });

    const taskTextElement = document.createElement("p");
    taskTextElement.classList.add("quickTaskContent");
    taskTextElement.textContent = taskObject.text;
    if (taskObject.completed) {
        taskTextElement.classList.add("completed"); // apply line-through
    } else {
        taskTextElement.classList.remove("completed");
    }

    const taskLabel = document.createElement("label");
    taskLabel.htmlFor = checkBox.id;
    taskLabel.append(taskTextElement);

    quickTaskRow.append(checkBox, taskLabel);
    return quickTaskRow;
}

function populateQuickCards() {
    const todaysTasks = document.querySelector(".todaysTasks");
    const overdueTasks = document.querySelector(".overdueTasks");
    const upcomingTasks = document.querySelector(".upcomingTasks");

    // clear the contents before re-population
    todaysTasks.innerHTML = '';
    overdueTasks.innerHTML = '';
    upcomingTasks.innerHTML = '';

    // Groups tasks according to their completion status to handle ordering
    // in the taskList container
    const incompleteTodaysTasks = document.createDocumentFragment();
    const completedTodaysTasks = document.createDocumentFragment();
    const incompleteOverdueTasks = document.createDocumentFragment();
    const completedOverdueTasks = document.createDocumentFragment();
    const incompleteUpcomingTasks = document.createDocumentFragment();
    const completedUpcomingTasks = document.createDocumentFragment();

    const allProjects = getAllProjects();

    // set the format of today's date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const todayFormatted = `${year}-${month}-${day}`; // returns today's date in YYYY-MM-DD format

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowDay = String(tomorrow.getDate()).padStart(2, "0");

    const tomorrowFormatted = `${year}-${month}-${tomorrowDay}`;

    const afterTomorrow = new Date();
    afterTomorrow.setDate(today.getDate() + 2);
    const afterTomorrowDay = String(afterTomorrow.getDate()).padStart(2, "0");

    const afterTomorrowFormatted = `${year}-${month}-${afterTomorrowDay}`;

    if (allProjects && allProjects.length > 0) {
        allProjects.forEach(projItem => {
            projItem.tasks.forEach(taskObject => {
                if (taskObject.dueDate) {
                    const taskRowElement = createQuickRowElement(taskObject, projItem.id); // create task row

                    if (taskObject.dueDate === todayFormatted) {
                        console.log(`Task "${taskObject.text}" (ID: ${taskObject.id}) is due today!`);

                        if (taskObject.completed) {
                            completedTodaysTasks.appendChild(taskRowElement);
                        } else {
                            incompleteTodaysTasks.appendChild(taskRowElement);
                        }
                    } else if (taskObject.dueDate < todayFormatted) {
                        if (taskObject.completed) {
                            completedOverdueTasks.appendChild(taskRowElement);
                        } else {
                            incompleteOverdueTasks.appendChild(taskRowElement);
                        }
                    } else if (taskObject.dueDate === tomorrowFormatted) {
                        if (taskObject.completed) {
                            completedUpcomingTasks.appendChild(taskRowElement);
                        } else {
                            incompleteUpcomingTasks.appendChild(taskRowElement);
                        }
                    } else if (taskObject.dueDate === afterTomorrowFormatted) {
                        if (taskObject.completed) {
                            completedUpcomingTasks.appendChild(taskRowElement);
                        } else {
                            incompleteUpcomingTasks.appendChild(taskRowElement);
                        }
                    }
                }
            });
        });

        // appends the taskRows AFTER looping through all tasks
        // adds incompleted tasks first, then completed tasks
        todaysTasks.appendChild(incompleteTodaysTasks);
        todaysTasks.appendChild(completedTodaysTasks);
        overdueTasks.appendChild(incompleteOverdueTasks);
        overdueTasks.appendChild(completedOverdueTasks);
        upcomingTasks.appendChild(incompleteUpcomingTasks);
        upcomingTasks.appendChild(completedUpcomingTasks);
    }

    // CONTINUE: FINE TUNE QUICK PANE BEHAVIOR eg. whether to add cards to quick panes if they are already marked complete 
}
export {loadApp, renderProjectCard, renderAllProjectCards, populateQuickCards}