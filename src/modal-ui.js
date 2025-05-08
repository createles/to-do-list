import { newProject } from "./project-data";

const modal = document.querySelector(".modal");
const exitButton = modal ? modal.querySelector(".exitButton") : null;
const titleInput = document.querySelector(".titleInput");
const taskInput = document.querySelector(".taskInput");

let currentProjIdForModal = null; // initialize to null on open

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
                currentProjIdForModal = createdProject.id; // set this open "session-window" to the projects id
            }
        } else {
            // existing project and is being updated
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