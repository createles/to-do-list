import { newProject, updateProject, selectProjectById } from "./project-data";
import { renderAllProjectCards } from "./project-template";

const modal = document.querySelector(".modal");
const modalContentArea = modal ? modal.querySelector(".modalContentArea") : null;
const exitButton = modal ? modal.querySelector(".exitButton") : null;
const modalBackground = modal ? modal.querySelector(".modalBackground") : null;

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

    // Custom-event to signal modal closure
    const modalClosedEvent = new CustomEvent('modalHasClosed', {
        bubbles: true, // So the event bubbles up the DOM Tree
        composed: true // allows event to cross DOM boundaries
    });

    modal.dispatchEvent(modalClosedEvent);
    console.log("modalHasClosed event dispatched.")

    const handleAnimationEnd = () => {
        modal.classList.remove("isVisible");

        if (modalContentArea) {
            // clear the content of the modal on exit
            modalContentArea.innerHTML = '';
        }

        currentProjIdForModal = null; // reset project id to null
        modal.removeEventListener("transitionend", handleAnimationEnd); // Remove event-listener
    };

    // Re-add event listener when transition (fade out) finishes
    modal.addEventListener("transitionend", handleAnimationEnd, { once: true })
}



// if exitButton exists, attach listener for hiding the modal and saving the project details
if (exitButton) {
    exitButton.addEventListener("click", () => {
        hideModal();
        renderAllProjectCards();
    });
} else if (modal) {
    console.warn("Modal exit button not found.");
}

// if you click outside the modal area (like the background), hideModal and save the project
if (modalBackground) {
    modalBackground.addEventListener("click", () => {
        hideModal();
        renderAllProjectCards();
    })
} else {
    console.error("Modal not visible.");
}

function initializeExistingPrioritySelector(selectorElement, initialPriority = 0, onChangeCallback) {
    if (!selectorElement) {
        console.error("Priority selector element not provided for initialization");
        return;
    }

    const circles = selectorElement.querySelectorAll(".priorityCircle");

    // Updates visual state of the circles
    const updateVisualState = (newSelectedPriority) => {
        circles.forEach(circle => {
            const circleValue = parseInt(circle.dataset.priorityValue, 10);
            if (circleValue <= newSelectedPriority) {
                circle.classList.add("isFilled");
                circle.setAttribute("aria-checked", "true");
            } else {
                circle.classList.remove("isFilled");
                circle.setAttribute("aria-checked", "false");
            }
        });
    };

    // Set initial state
    updateVisualState(initialPriority);

    // Adds listener to container to observe circle clicks
    const handleInteraction = (targetElement) => {
        if (targetElement && targetElement.classList.contains("priorityCircle")) {
            const newPriority = parseInt(targetElement.dataset.priorityValue, 10);
            updateVisualState(newPriority); // Update the visual state to reflect proper level

            if (typeof onChangeCallback === "function") {
                onChangeCallback(newPriority); // Notify about changes made
            }
        }
    };

    selectorElement.addEventListener("click", (event) => {
        handleInteraction(event.target);
    });

    selectorElement.addEventListener("keydown", (event) => {
        if (event.target.classList.contains("priorityCircle") && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            handleInteraction(event.target);
        }
    });

    // Updating selector witout interacting with the element (data changes observed)
    selectorElement.updateDisplay = (newPriority) => {
        updateVisualState(newPriority);
    };
}

function addTaskInputRow(containerElement) {
    if (!containerElement) return;

    // format for a new task row
    const taskRowHtml = `
                    <div class="taskInputRow" data-task-id="" data-completed="false" data-priority="0" data-due-date="">
                        <input type="checkbox" class="taskCheckBoxNew" aria-label="Mark task complete">
                        <input type="text" class="taskTextInputNew" placeholder="add task...">
                        <div class="prioritySelector" aria-label="Task priority">
                            <span class="priorityCircle" data-priority-value="1" role="button" tabindex="0" aria-label="Set priority to 1: Low"></span>
                            <span class="priorityCircle" data-priority-value="2" role="button" tabindex="0" aria-label="Set priority to 2: Medium"></span>
                            <span class="priorityCircle" data-priority-value="3" role="button" tabindex="0" aria-label="Set priority to 3: High"></span>
                        </div>
                        <input type="date" class"taskDueDateInput" aria-label="Task due date">
                        <button class="taskDelete">x</button>
                    </div>
    `;

    // inserts a new task row set into the modal task area
    containerElement.insertAdjacentHTML('beforeend', taskRowHtml);

    // select the new task row,
    const newRowElement = containerElement.querySelector(".taskInputRow:last-child");
    if (newRowElement) {
        const prioritySelectorElement = newRowElement.querySelector(".prioritySelector");
        if (prioritySelectorElement) {
            // set event listeners and initial priority state for the entire task row
            initializeExistingPrioritySelector(prioritySelectorElement, 0, (newPriority) => {
                console.log(`Priority for a task in a new row was set to: ${newPriority}`);
                // sets the dataset property of the ENTIRE ROW (the task item) to have selectedPriority
                // which will TEMPORARILY STORE the priority for use when item is blurred or the enter button is pressed
                newRowElement.dataset.priority = newPriority;
            })
        }

        // set event listener for checked status
        const newCheckBox = newRowElement.querySelector(".taskCheckBoxNew");
        if (newCheckBox) {
            newCheckBox.addEventListener("change", (event) => {
                newRowElement.dataset.completed = event.target.checked;
            });
        }

        // set event listener for value changes for DATE input
        const newDueDateInput = newRowElement.querySelector(".taskDueDateInput");
        if (newDueDateInput) {
            newDueDateInput.addEventListener("change", (event) => {
                newRowElement.dataset.dueDate = event.target.value; // date stored in "YYYY-MM-DD" or "" format
            })
        }

        // set event listener to delete taskInputRow with delete button
        // update the project to remove the selected task
        const deleteButton = newRowElement.querySelector(".taskDelete");
        if (deleteButton) {
            deleteButton.addEventListener("click", () => {
                newRowElement.remove();
                console.log("Task deleted from UI.");

                // If project has already been created and saved; need to update project
                if (currentProjIdForModal !== null) {

                    if (!containerElement) {
                        console.log("Could not find task area container to re-collect and update tasks.");
                        return;
                    }

                    const taskObjects = [];
                    const remainingTaskRowElements = containerElement.querySelectorAll(".taskInputRow");

                    remainingTaskRowElements.forEach((rowEl, index) => {
                        const textInput = rowEl.querySelector(".taskTextInputNew");
                        const taskText = textInput ? textInput.value.trim() : "";

                        if (taskText) { // Only include tasks that have text
                            const isCompleted = rowEl.dataset.completed === 'true';
                            // Ensure you are reading the correct dataset attribute for priority
                            const priority = parseInt(rowEl.dataset.priority || rowEl.dataset.selectedPriority, 10) || 0;
                            const dueDateValue = rowEl.dataset.dueDate;

                            taskObjects.push({
                                // retain taskId for retained tasks
                                id: rowEl.dataset.taskId || `task_${currentProjIdForModal}_temp_${index}_${Date.now()}`, // Temporary ID if old one isn't set on row
                                text: taskText,
                                completed: isCompleted,
                                priority: priority,
                                dueDate: dueDateValue || null
                            });
                        }
                    });
                    console.log(`Updating project ${currentProjIdForModal} after task deletion. New task list:`, taskObjects);
                    // Now call updateProject with the newly formed list of tasks
                    updateProject(currentProjIdForModal, { tasks: taskObjects });
                } else {
                    // If currentProjIdForModal is null, the project hasn't been created yet.
                    // Simply removing the row from the DOM is enough.
                    // The main save (handleSaveNewProject) will later collect tasks from remaining rows.
                    console.log("Task row removed from UI before initial project save. Data will be correct on save.");
                }
            });
        }
    }
}

function gatherAndSaveModalData() {
    if (!modalContentArea) {
        console.error("Modal content area not found. Cannot save.");
        return false;
    }

    // Get project title
    const titleElement = modalContentArea.querySelector(".titleText") || // Used in openModalForExistingProject
                              modalContentArea.querySelector(".titleInput");      // Used in openModalForNewProj

    // if no title, display warning
    if (!titleElement) {
        console.warn("No title element found in modal.")
    }

    const currentProjectTitle = titleElement ? titleElement.value.trim() : "";

    // Collect Task Objects from all .taskInputRow elements
    const taskObjects = [];
    const taskRowElements = modalContentArea.querySelectorAll(".taskInputRow");

    taskRowElements.forEach((rowEl, index) => {
        // Query for task text input (could be .taskTextInputNew or .taskTextInputExisting)
        const textInput = rowEl.querySelector(".taskTextInputNew") || rowEl.querySelector(".taskTextInputExisting");
        const taskText = textInput ? textInput.value.trim() : "";

        if (taskText) { // Only process rows that have task text
            const checkbox = rowEl.querySelector(".taskCheckBoxNew") || rowEl.querySelector(".taskCheckBoxExisting");
            // If the checkbox itself is the source of truth for 'completed' when saving:
            const isCompleted = checkbox ? checkbox.checked : (rowEl.dataset.completed === 'true');

            // Priority and Due Date are read from dataset attributes,
            // which should be updated by their respective UI components' event listeners.
            const priority = parseInt(rowEl.dataset.priority || rowEl.dataset.selectedPriority, 10) || 0; // Handle both dataset names for now
            const dueDateValue = rowEl.dataset.dueDate;

            const existingTaskId = rowEl.dataset.taskId; // Will be present for tasks loaded for an existing project, or after first save for new tasks

            taskObjects.push({
                id: existingTaskId || `task_new_${Date.now()}_${index}`, // Use existing ID, or generate a new one for truly new tasks
                text: taskText,
                completed: isCompleted,
                priority: priority,
                dueDate: dueDateValue || null // Ensure empty string from date input becomes null
            });
        }
    });
    console.log("Gathered task objects for save/update:", JSON.stringify(taskObjects, null, 2));

    // Save/Update Logic
    if (currentProjIdForModal === null) { // CREATING A NEW PROJECT
        // Only create if there's a title or at least one task
        if (!currentProjectTitle && taskObjects.length === 0) {
            console.log("New project: Empty title and no tasks. Not creating.");
            return false;
        }
        const effectiveTitle = currentProjectTitle || "Untitled";
        const createdProject = newProject(effectiveTitle); // from project-data.js

        if (createdProject && createdProject.id !== undefined) {
            currentProjIdForModal = createdProject.id; // CRITICAL: Update module-level ID for this session
            
            // Update the newly created tasks with the final project ID in their task IDs
            // And update data-task-id on the DOM rows for consistency if they are edited again in this session
            const finalTaskObjects = taskObjects.map((task, index) => {
                const newTaskId = task.id.startsWith("task_new_") ? `task_${currentProjIdForModal}_${index}_${Date.now()}` : task.id;
                if (taskRowElements[index]) { // Make sure the row element still exists
                    taskRowElements[index].dataset.taskId = newTaskId; // Set persistent ID on the DOM row
                }
                return { ...task, id: newTaskId };
            });

            updateProject(currentProjIdForModal, { tasks: finalTaskObjects });
            console.log(`New project ${currentProjIdForModal} ('${effectiveTitle}') created and tasks updated.`);
            return true;
        } else {
            console.error("Failed to create new project shell.");
            return false;
        }
    } else { // UPDATING AN EXISTING PROJECT
        console.log(`Updating project ID: ${currentProjIdForModal} ('${currentProjectTitle}')`);
        // For existing projects, ensure new tasks added get a proper ID structure
        const finalTaskObjectsForUpdate = taskObjects.map((task, idx) => {
             if (task.id.startsWith("task_new_")) { // Task was newly added to this existing project
                const newTaskId = `task_${currentProjIdForModal}_${idx}_${Date.now()}`;
                 if (taskRowElements[idx]) {
                    taskRowElements[idx].dataset.taskId = newTaskId;
                }
                return { ...task, id: newTaskId };
             }
             return task; // Existing tasks should already have their persistent IDs
        });
        updateProject(currentProjIdForModal, { title: currentProjectTitle, tasks: finalTaskObjectsForUpdate });
        return true;
    }
}

function openModalForNewProj() {
    console.log("Setting up modal for a NEW project...");
    currentProjIdForModal = null; // reset state of modal to set up new project

    // Custom-event to signal modal opening
    const modalOpenedEvent = new CustomEvent('modalHasOpened', {
        bubbles: true, // So the event bubbles up the DOM Tree
        composed: true // allows event to cross DOM boundaries
    });

    modal.dispatchEvent(modalOpenedEvent);
    console.log("modalHasOpened event dispatched.")

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
        const titleSaveHandler = () => {
            gatherAndSaveModalData();
        };

        // calls title save to NEW PROJECT or EXISTING PROJECT
        titleInput.addEventListener("blur", debounce(titleSaveHandler, 300));
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

        // **OLD**
        // // blur doesn't bubble up the DOM so focusout is used
        // taskAreaContainer.addEventListener('focusout', (event) => {
        //     // check if blur was fired from a task text input 
        //     if (event.target.classList.contains("taskTextInputNew")) {
        //         const blurredTaskInput = event.target;

        //         if (blurredTaskInput.value.trim() !== "") {
        //             console.log("Task input blurred:", blurredTaskInput.value);

        //             const titleInput = modalContentArea.querySelector(".titleInput");
        //             const currentTitle = titleInput ? titleInput.value.trim() : "";

        //             const allTaskInputs = taskAreaContainer.querySelectorAll(".taskTextInputNew");
        //             // creates a shallow copied version of the array of the objects in allTaskInputs
        //             const allTaskStrings = Array.from(allTaskInputs)
        //                 .map(input => input.value.trim())
        //                 .filter(Boolean); // filters out empty task strings

        //             console.log(`Updating project ${currentProjIdForModal} with title: "${currentTitle}" and tasks:`, allTaskStrings)
        //             updateProject(currentProjIdForModal, { title: currentTitle, tasks: allTaskStrings });
        //         }
        //     }
        // });

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

function openModalForExistingProject(projectId) {
    const project = selectProjectById(projectId);

    if (!project) {
        console.error(`Project with ID ${projectId} not found.`);
        return;
    }

    currentProjIdForModal = projectId;
    console.log(`Opening modal for existing project: ${project.title} (ID: ${projectId})`);

    if (!modalContentArea) {
        console.error("Modal Content Area not found!");
        return;
    }

    // Display project title (as a p) and tasks area
    const existingProjectHtml = `
        <p class="titleText">${project.title}</p>
                <div class="taskArea">
                    <h4>To-do:</h4>
                </div>
    `;

    let existingTasksHtml = "";

    if (project.tasks && project.tasks.length > 0) {
        project.tasks.forEach(task => {
            // For each task object, create its HTML row
            // Note: data-task-id is crucial here
            existingTasksHtml += `
                <div class="taskInputRow existingTaskRow" data-task-id="${task.id}">
                        <input type="checkbox" class="taskCheckBoxExisting" ${task.completed ? 'checked' : ''} aria-label="Mark task complete">
                        <input type="text" class="taskTextInputExisting" value="${task.text}" placeholder="add task...">
                        <div class="prioritySelector existingPrioritySelector" aria-label="Task priority">
                            <span class="priorityCircle" data-priority-value="1" role="radio" tabindex="0" aria-label="Set priority to 1: Low"></span>
                            <span class="priorityCircle" data-priority-value="2" role="radio" tabindex="0" aria-label="Set priority to 2: Medium"></span>
                            <span class="priorityCircle" data-priority-value="3" role="radio" tabindex="0" aria-label="Set priority to 3: High"></span>
                        <input type="date" class="taskDueDateInputExisting" value="${task.dueDate || ''}" aria-label="Task due date">
                    </div>
                </div>
            `;
        });
    } else {
        existingTasksHtml += `<div class="taskInputRow" data-task-id="" data-completed="false" data-priority="0" data-due-date="">
                        <input type="checkbox" class="taskCheckBoxNew" aria-label="Mark task complete">
                        <input type="text" class="taskTextInputNew" placeholder="add task...">
                        <div class="prioritySelector" aria-label="Task priority">
                            <span class="priorityCircle" data-priority-value="1" role="button" tabindex="0" aria-label="Set priority to 1: Low"></span>
                            <span class="priorityCircle" data-priority-value="2" role="button" tabindex="0" aria-label="Set priority to 2: Medium"></span>
                            <span class="priorityCircle" data-priority-value="3" role="button" tabindex="0" aria-label="Set priority to 3: High"></span>
                        </div>
                        <input type="date" class="taskDueDateInput" aria-label="Task due date">
                        <button class="taskDelete">x</button>
                    </div>
    `
    };

    modalContentArea.innerHTML = existingProjectHtml + existingTasksHtml;

    // Initializing priority, completed, and date states for each task row
    const existingTaskRows = modalContentArea.querySelectorAll(".existingTaskRow");
    existingTaskRows.forEach(rowElement => {
        const taskId = rowElement.dataset.taskId;
        const taskData = project.tasks.find(t => t.id === taskId); // Get the specific task data

        // Display exisiting priorty
        if (taskData) {
            const prioritySelectorDiv = rowElement.querySelector(".existingPrioritySelector");
            if (prioritySelectorDiv) {
                initializeExistingPrioritySelector(prioritySelectorDiv, taskData.priority, (newPriority) => {
                    console.log(`Priority for task ID ${taskId} changed to ${newPriority}`);
                    // Find task in project.tasks, update its priority, then call updateProject
                    const taskToUpdate = project.tasks.find(t => t.id === taskId);
                    if (taskToUpdate) {
                        taskToUpdate.priority = newPriority;
                        updateProject(currentProjIdForModal, { tasks: project.tasks });
                    }
                });
            }

            // Attach eventListners for the current task rows checkbox, textInput, and date
            // These listeners will find the task by taskId, update it, and call updateProject
            const checkbox = rowElement.querySelector('.taskCheckBoxExisting');
            if (checkbox) {
                checkbox.addEventListener('change', (event) => {
                    const taskToUpdate = project.tasks.find(t => t.id === taskId);
                    if (taskToUpdate) {
                        taskToUpdate.completed = event.target.checked;
                        updateProject(currentProjIdForModal, { tasks: project.tasks });
                    }
                });
            }

            const textInput = rowElement.querySelector('.taskTextInputExisting');
            if (textInput) {
                textInput.addEventListener('blur', debounce(() => { // Use debounce
                    const taskToUpdate = project.tasks.find(t => t.id === taskId);
                    if (taskToUpdate && taskToUpdate.text !== textInput.value.trim()) {
                        taskToUpdate.text = textInput.value.trim();
                        updateProject(currentProjIdForModal, { tasks: project.tasks });
                    }
                }, 300));
            }

            const dueDateInput = rowElement.querySelector('.taskDueDateInputExisting');
            if (dueDateInput) {
                dueDateInput.addEventListener('change', (event) => {
                     const taskToUpdate = project.tasks.find(t => t.id === taskId);
                     if (taskToUpdate) {
                         taskToUpdate.dueDate = event.target.value || null;
                         updateProject(currentProjIdForModal, { tasks: project.tasks });
                     }
                });
            }

            // set event listener to delete taskInputRow with delete button
            // update the project to remove the selected task
            const deleteButton = rowElement.querySelector(".taskDelete");
            if (deleteButton) {
                deleteButton.addEventListener("click", () => {
                    newRowElement.remove();
                    console.log("Task deleted from UI.");

                    // If project has already been created and saved; need to update project
                    if (currentProjIdForModal !== null) {

                        if (!containerElement) {
                            console.log("Could not find task area container to re-collect and update tasks.");
                            return;
                        }

                        const taskObjects = [];
                        const remainingTaskRowElements = containerElement.querySelectorAll(".taskInputRow");

                        remainingTaskRowElements.forEach((rowEl, index) => {
                            const textInput = rowEl.querySelector(".taskTextInputNew");
                            const taskText = textInput ? textInput.value.trim() : "";

                            if (taskText) { // Only include tasks that have text
                                const isCompleted = rowEl.dataset.completed === 'true';
                                // Ensure you are reading the correct dataset attribute for priority
                                const priority = parseInt(rowEl.dataset.priority || rowEl.dataset.selectedPriority, 10) || 0;
                                const dueDateValue = rowEl.dataset.dueDate;

                                taskObjects.push({
                                    // retain taskId for retained tasks
                                    id: rowEl.dataset.taskId || `task_${currentProjIdForModal}_temp_${index}_${Date.now()}`, // Temporary ID if old one isn't set on row
                                    text: taskText,
                                    completed: isCompleted,
                                    priority: priority,
                                    dueDate: dueDateValue || null
                                });
                            }
                        });
                        console.log(`Updating project ${currentProjIdForModal} after task deletion. New task list:`, taskObjects);
                        // Now call updateProject with the newly formed list of tasks
                        updateProject(currentProjIdForModal, { tasks: taskObjects });
                    } else {
                        // If currentProjIdForModal is null, the project hasn't been created yet.
                        // Simply removing the row from the DOM is enough.
                        // The main save (handleSaveNewProject) will later collect tasks from remaining rows.
                        console.log("Task row removed from UI before initial project save. Data will be correct on save.");
                    }
                });
            }
        }
    });

    // Add listener for the main project title input
    const projectTitleInput = modalContentArea.querySelector(".titleInput");
    if (projectTitleInput) {
        projectTitleInput.addEventListener('blur', debounce(() => {
            if (project.title !== projectTitleInput.value.trim()) {
                project.title = projectTitleInput.value.trim(); // Update local copy
                updateProject(currentProjIdForModal, { title: project.title }); // Save only title
            }
        }, 300));
    }

    // add listener for p if title already exists
    const projectTitleP = modalContentArea.querySelector(".titleText");
    if (projectTitleP) {

        // Re-usable edit on-click function
        const makeTitleEditableOnClick = (pElement) => {
            pElement.addEventListener("click", function handleClickToEdit() {
                // Store the original title text
                const originalTitle = pElement.textContent;

                // Create the new input element
                const titleEditInput = document.createElement('input');
                titleEditInput.type = 'text';
                titleEditInput.className = 'titleInput'; // Use a consistent class
                titleEditInput.value = originalTitle;   // Pre-fill with current title
                titleEditInput.placeholder = 'Title';

                // Replace the <p> element with the new <input> element
                if (pElement.parentNode) {
                    pElement.parentNode.replaceChild(titleEditInput, pElement);
                } else {
                    // Fallback if pElement somehow lost its parent (shouldn't happen here)
                    console.error("Could not replace title paragraph, parent not found.");
                    return;
                }

                // Automatically focus the new input field
                titleEditInput.focus();
                // Select the text in the input for easier editing
                titleEditInput.select();

                // unction to revert back to <p> and save (if changed)
                const saveAndRevertToP = () => {
                    const newTitle = titleEditInput.value.trim();

                    // Create the new <p> element to display the title
                    const newP = document.createElement('p');
                    newP.className = 'titleText'; // Re-apply original class
                    newP.textContent = newTitle || originalTitle; // Use new title, or original if new is empty

                    // Replace the input with the new <p>
                    if (titleEditInput.parentNode) {
                        titleEditInput.parentNode.replaceChild(newP, titleEditInput);
                    }

                    // Save the changes if the title actually changed
                    if (newTitle && newTitle !== originalTitle) {
                        console.log(`Title changed from "${originalTitle}" to "${newTitle}"`);
                        project.title = newTitle; // Update the local project object
                        // Call your updateProject function from project-data.js
                        updateProject(currentProjIdForModal, { title: newTitle });
                    }

                    // Make the new <p> element editable again
                    makeTitleEditableOnClick(newP);
                };

                // 5. Add event listeners to the input to save and revert
                titleEditInput.addEventListener('blur', saveAndRevertToP);

                titleEditInput.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault(); 
                        titleEditInput.blur();    // Trigger blur to save and revert
                    } else if (event.key === 'Escape') {
                        // Revert to original title without saving changes
                        const originalP = document.createElement('p');
                        originalP.className = 'titleText';
                        originalP.textContent = originalTitle;
                        if (titleEditInput.parentNode) {
                            titleEditInput.parentNode.replaceChild(originalP, titleEditInput);
                        }
                        makeTitleEditableOnClick(originalP); // Make it editable again
                    }
                });
            }, { once: true }); // { once: true } ensures the listener is removed after first click,
            // preventing issues if not handled carefully inside.
            // The makeTitleEditableOnClick re-adds it to the new <p>.
        };

        // Initial call to make the title paragraph editable
        makeTitleEditableOnClick(projectTitleP);
    }

    showModal();
}
export { showModal, openModalForNewProj, openModalForExistingProject };