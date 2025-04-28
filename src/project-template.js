function createProject() {
    const projFolder = document.querySelector("#projFolder");

    const project = document.createElement("div");
    
    project.style.width = "60%";
    project.style.height = "60%";
    project.style.backgroundColor = "pink";

    projFolder.append(project);
}

export {createProject};