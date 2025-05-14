import { newProject, updateProject } from "./project-data";
import { renderAllProjectCards } from "./project-template";

const modal = document.querySelector(".modal");
const modalContentArea = modal ? modal.querySelector(".modalContentArea") : null;
const exitButton = modal ? modal.querySelector(".exitButton") : null;

let currentProjIdForModal = null; // initialize to null on open

// --- Debounce Utility (Optional but recommended for blur saves) ---
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Make modal visible
function showModal() {
    // debugging for missing modal
    if (!modal) {
        console.error("Modal element not found.");
        return
    }

    modal.classList.add("isVisible");
    requestAnimationFrame(() => {
        modal.classList.add("isFadedIn");
    });
}

// Hide modal visually, reset contents
function hideModal() {
    if (!modal || !modal.classList.contains("isVisible")) {
        return; // Modal is not visible
    }

    modal.classList.remove("isFadedIn"); // Trigger fade-out animation

    const handleAnimationEnd = () => {
        modal.classList.remove("isVisible");

        if (modalContentArea) {
            // clear the content of the modal on exit
            modalContentArea.innerHTML = '';
        }

        currentProjIdForModal = null; // reset project id to null
        modal.removeEventListener("transitionend", handleAnimationEnd); // Remove event-listener
    }

    // Re-add event listener when transition (fade out) finishes
    modal.addEventListener("transitionend", handleAnimationEnd, { once: true })
}



// if exitButton exists, attach listener for hiding the modal
if (exitButton) {
    exitButton.addEventListener("click", () => {
        hideModal();
        renderAllProjectCards();
    });
} else if (modal) {
    console.warn("Modal exit button not found.");
}

function addTaskInputRow(containerElement) {
    if (!containerElement) return;

    const taskRowHtml = `
                    <div class="taskInputRow">
                        <input type="checkbox" class="taskCheckBoxNew" aria-label="Mark task complete">
                        <input type="text" class="taskTextInputNew" placeholder="add task...">
                    </div>
    `;

    containerElement.insertAdjacentHTML('beforeend', taskRowHtml);
}

function openModalForNewProj() {
    console.log("Setting up modal for a NEW project...");
    currentProjIdForModal = null; // reset state of modal to set up new project

    if (!modalContentArea) {
        console.error("Cannot open modal: Modal Content Area doesnt exist!");
        return;
    }

    const newProjectHtml = `
                <input type="text" class="titleInput" placeholder="Title">
                <div class="taskArea">
                    <h4>To-do:</h4>
                </div>`;

    // set base elements for setting up new project (inputs)
    modalContentArea.innerHTML = newProjectHtml;

    // create references for newly created input elements
    const titleInput = modalContentArea.querySelector(".titleInput");
    const taskAreaContainer = modalContentArea.querySelector(".taskArea");

    if (taskAreaContainer) {
        addTaskInputRow(taskAreaContainer);
    } else {
        console.error("Task area container not found.");
        return; //
    }

    if (titleInput) {
        // callback function for when exiting the title input element
        const handleTitleSave = () => {
            // .trim() just removes any leading and trailing whitespace from the string
            const currentTitle = titleInput.value.trim();
            console.log(`Title blurred; Title: "${currentTitle}", Current ID: ${currentProjIdForModal}`); // logging purposes

            // Collating all Tasks and their values
            const taskInputs = taskAreaContainer.querySelectorAll(".taskTextInputNew");
            // For now, we only save the text, ignoring checkbox state for new projects
            const tasks = Array.from(taskInputs)
                .map(input => input.value.trim())
                .filter(Boolean); // keep the NON-EMPTY task strings

            // prevents project creation on empty title and project not initialized
            if (!currentTitle && currentProjIdForModal === null) {
                console.log("No title input detected. Project not saved.");
                return;
            }

            // if title exists but no project ID, create a new project
            if (currentProjIdForModal === null || currentProjIdForModal === undefined) {
                // new project is created and saved to localStorage
                console.log("Attempting to create a new project...");
                const createdProject = newProject(currentTitle); // from project-data.js
                if (createdProject && createdProject.id !== undefined) {
                    currentProjIdForModal = createdProject.id; // set this open "session-window" to the project's id
                    console.log(`New project has successfully been created. Project ID: ${currentProjIdForModal}`);
                    // If tasks exists, update the newly created project
                    if (tasks.length > 0) {
                        console.log(`Updating new project with project ID: ${currentProjIdForModal} with tasks:`, tasks);
                        updateProject(currentProjIdForModal, { tasks: tasks });
                    }
                } else {
                    console.log("Failed to create a new project.");
                }
            } else {
                // Update existing project
                console.log(`Updating project ID: ${currentProjIdForModal}. Title: "${currentTitle}", Tasks:`, tasks)
                updateProject(currentProjIdForModal, { title: currentTitle, tasks: tasks });
            }
        };

        // calls title save to NEW PROJECT or EXISTING PROJECT
        titleInput.addEventListener("blur", debounce(handleTitleSave, 300));
        titleInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                titleInput.blur();
            }
        });
        requestAnimationFrame(() => titleInput.focus());
    } else {
        console.error("Could not find title input element after rendering!");
    }

    // Handles new input row creation on successfull task input confirmation
    if (taskAreaContainer) {
        taskAreaContainer.addEventListener('input', (event) => {
            // check if an event fired from a task text input and if it is the last one in the container
            if (event.target.classList.contains("taskTextInputNew")) {
                const currentRow = event.target.closest(".taskInputRow");
                // check if currentRow is the last input row
                if (currentRow && currentRow === taskAreaContainer.querySelector(".taskInputRow:last-child")) {
                    // if user input a value into the last input, create a new input row
                    if (event.target.value.trim() !== "") {
                        addTaskInputRow(taskAreaContainer);
                    }
                }
            }
        });

        taskAreaContainer.addEventListener("keydown", (event) => {
            if (event.target.classList.contains("taskTextInputNew") && event.key === "Enter") {
                event.preventDefault();
                const currentRow = event.target.closest(".taskInputRow");
                // Add new row if last row OR if next row's input is empty
                const nextRow = currentRow ? currentRow.nextElementSibling : null;
                // is evaluated as true or false; if nextRow exists, then isLastRow is false, if it doesnt, isLastRow is true
                const isLastRow = !nextRow;

                if (isLastRow) {
                    // if the last row has a value in the input field, create a new row
                    if (currentRow.value) {
                        addTaskInputRow(taskAreaContainer);
                        // Focus on the new Input added
                        const newInput = taskAreaContainer.querySelector(".taskInputRow:last-child .taskTextInputNew");
                        if (newInput) requestAnimationFrame(() => newInput.focus());
                    }
                } else if (nextRow) {
                    // Focus the next existing input if it's not empty
                    const nextInput = nextRow.querySelector(".taskTextInputNew");
                    if (nextInput) requestAnimationFrame(() => nextInput.focus());
                }
            }
        });
    }

    showModal();
}

export { showModal, openModalForNewProj };