function renderProjectItem(currentProjectItem) {
    const projFolder = document.querySelector("#projFolder")
    const project = currentProjectItem;
    const projectCard = document.createElement("div");
    projectCard.classList.add("projectCard");

    projectCard.textContent = project.title;

    projFolder.append(projectCard);
}

export {renderProjectItem}