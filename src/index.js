import "./styles.css";
import { newProject, getAllProjects } from "./project-data";
import { renderProjectItem } from "./project-template";

newProject("Read Game of Thrones");
newProject("Play Clair Obscura: Expedition 33");
console.log(getAllProjects());

// renderProjectItem()