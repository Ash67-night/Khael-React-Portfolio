const education = [
  ["2024 to present", "Bachelor of Science in Information Technology", "Major in Network Administration. Laguna State Polytechnic University, Siniloan, Laguna."],
  ["2021 to 2023", "Senior High School", "General Academics Strand (GAS). Infanta National High School, Infanta, Quezon."],
  ["2017 to 2021", "Junior High School", "Infanta National High School, Infanta, Quezon."]
];

export default function Education() {
  return (
    <section id="education">
      <h2>Education</h2>

      <ol className="tl" style={{ marginTop: "32px" }}>
        {education.map(([year, title, description]) => (
          <li key={title}>
            <span className="yr">{year}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
