import "./styles.css";
import { newProject, getAllProjects, selectProjectById, removeProject } from "./project-data";
import { loadApp, renderProjectCard } from "./project-template";

console.log(getAllProjects());

console.log(selectProjectById(0));
removeProject(0);
console.log(selectProjectById(1));
console.log(selectProjectById(0));
loadApp();