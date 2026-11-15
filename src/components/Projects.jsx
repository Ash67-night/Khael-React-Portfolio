import { useEffect, useState } from "react";
import { getJSON } from "../api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    getJSON("/api/projects")
      .then((data) => {
        setProjects(data);
        setStatus("ready");
      })
      .catch((error) => {
        console.error("Could not load projects:", error);
        setStatus("error");
      });
  }, []);

  return (
    <section id="projects">
      <h2>Projects</h2>
      <p className="lead">Previous Projects and Academic Work.</p>

      {status === "loading" && <p>Loading projects...</p>}
      {status === "error" && (
        <p>Could not load projects. Check that the backend and database are running.</p>
      )}
      {status === "ready" && projects.length === 0 && <p>No projects added yet.</p>}

      <div className="grid">
        {projects.map((project) => (
          <article className="card" key={project.id}>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            {project.technologies && <div className="tags">{project.technologies}</div>}
            {project.project_link && (
              <p style={{ marginTop: "12px" }}>
                <a href={project.project_link} target="_blank" rel="noreferrer">
                  View project
                </a>
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
