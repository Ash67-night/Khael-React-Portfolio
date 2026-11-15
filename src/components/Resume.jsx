export default function Resume() {
  return (
    <section id="resume">
      <h2>Resume</h2>

      <div className="resume">
        <div className="doc" aria-hidden="true">
          <i></i><i></i><i></i>
          <i style={{ width: "70%" }}></i>
          <i></i><i></i>
          <i style={{ width: "80%" }}></i>
        </div>

        <div>
          <p className="lead" style={{ marginBottom: "20px" }}>
            One page with my education, skills, projects and certificates.
          </p>

          <a className="btn" href="/resume.pdf" download>
            Download resume (PDF)
          </a>
        </div>
      </div>
    </section>
  );
}
