import "./styles.css";
import { newProject, getAllProjects, selectProjectById, removeProject } from "./project-data";
import { loadApp, renderProjectItem, showModal } from "./project-template";

newProject("Read Game of Thrones");
newProject("Play Clair Obscura: Expedition 33");
console.log(getAllProjects());

console.log(selectProjectById(0));
removeProject(0);
console.log(selectProjectById(1));
console.log(selectProjectById(0));
loadApp();
// renderProjectItem();