import { newProject, updateProject } from "./project-data";

const modal = document.querySelector(".modal");
const modalContentArea = document.querySelector(".modalContentArea");
const exitButton = modal ? modal.querySelector(".exitButton") : null;
const titleInput = document.querySelector(".titleInput");
const taskInput = document.querySelector(".taskInput");

let currentProjIdForModal = null; // initialize to null on open

function renderNewProjectModal() {
    if (!modalContentArea) return;
    currentProjIdForModal = null;
    modalContentArea.innerHTML = `
                <input type="text" id="modalTitlInput" class="titleInput" placeholder="Title">
                <div id="modalTaskArea" class="taskArea">
                    <input type="text" class="taskInput" placeholder="What needs doing?">
                </div>
    `;

}

// function to make modal visible
function showModal() {
    modal.classList.add("isVisible");
    requestAnimationFrame(() => {
        modal.classList.add("isFadedIn");
    });
}

if (titleInput) {
    // callback function for when exiting the title input element
    const handleTitleSave = () => {
        const currentTitle = titleInput.value;
        if (currentProjIdForModal === null || currentProjIdForModal === undefined) {
            // new project is created and saved to localStorage
            const createdProject = newProject(currentTitle);
            if (createdProject) {
                currentProjIdForModal = createdProject.id; // set this open "session-window" to the project's id
            }
        } else {
            const projectIdToUpdate = currentProjIdForModal;
            const newTitle = titleInput.value;

            const updatedTitle = {
                title: newTitle
            }
        }
    }

    // calls title save to NEW PROJECT or EXISTING PROJECT
    titleInput.addEventListener("blur", handleTitleSave);
    titleInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleTitleSave();
            titleInput.blur();
        }
    })
}

function hideModal() {
    if (!modal || !modal.classList.contains("isVisible")) {
        return;
    }

    modal.classList.remove("isFadedIn");

    const handleAnimationEnd = () => {
        modal.classList.remove("isVisible");

        modal.removeEventListener("transitionend", handleAnimationEnd);
    }

    modal.addEventListener("transitionend", handleAnimationEnd, {once: true})
}

if (modal) {
    if (exitButton) {
        exitButton.addEventListener("click", hideModal);
    }
}

titleInput.addEventListener("blur", () => {
    newProject(titleInput.value);
    titleInput
})

export {showModal};