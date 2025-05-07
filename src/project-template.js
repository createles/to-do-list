function loadApp() {
    const projFolder = document.querySelector("#projFolder")

    if (!projFolder.hasChildNodes()) {
        const centerButton = createAddButton();
        centerButton.id = "centerButton";
        const caption = document.createElement("p");
        caption.textContent = "Add your first to-do-note!"
        centerButton.insertBefore(caption, centerButton.firstChild);
        projFolder.append(centerButton);
    } else {
        console.log("wenk");
    }
}

function createAddButton() {
    const addButton = document.createElement("button");
    addButton.classList.add("addButton");
    addButton.textContent = "+";
    addButton.addEventListener("click", showModal);
    return addButton;
}

function showModal() {
    const modal = document.querySelector(".modal");
    modal.classList.add("isVisible");
    requestAnimationFrame(() => {
        modal.classList.add("isFadedIn");
    });
}

function renderProjectItem(currentProjectItem) {
    const projFolder = document.querySelector("#projFolder")
    const project = currentProjectItem;
    const projectCard = document.createElement("div");
    projectCard.classList.add("projectCard");

    projectCard.textContent = project.title;

    projFolder.append(projectCard);
}

export {loadApp, renderProjectItem, showModal}