export default function About() {
  return (
    <section id="about">
      <h2>About me</h2>

      <div className="about">
        <div className="photo">
          <img src="/images/profile.jpg" alt="Photo of Khael Ashly P. Tena" />
        </div>

        <div>
          <p className="lead" style={{ marginBottom: "12px" }}>
            I'm a BSIT student majoring in Network Administration. I like
            understanding how data moves from one device to another, and I like
            fixing it when it stops. I'm choosing this major because I'd like
            to explore more about how networks work, and I'm also curious about hardware.
          </p>

          <ul className="facts">
            <li><b>Schooling:</b> Currently an undergraduate at LSPU, Laguna, Siniloan Campus</li>
            <li><b>Live:</b> Infanta, Quezon, Philippines</li>
            <li><b>Focus:</b> Network design, server administration, security basics</li>
            <li><b>Interests:</b> Home lab, open-source tools, cybersecurity challenges</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
