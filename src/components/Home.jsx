export default function Home() {
  return (
    <section id="home" className="hero">
      <div>
        <h1>Hi, I'm Khael Ashly P. Tena</h1>
        <p className="role">BSIT student major in Network Administration</p>
        <p>
          I build and troubleshoot small networks: routing, switching, servers
          and security. Explore my work where my skills and achievements are shown.
        </p>

        <div className="btns">
          <a className="btn" href="#projects">View my projects</a>
          <a className="btn alt" href="#contact">Contact me</a>
        </div>
      </div>

      <div className="topo" aria-hidden="true">
        <svg viewBox="0 0 400 300">
          <path className="ln" d="M200 50 L200 130" />
          <path className="ln" d="M200 130 L90 220" />
          <path className="ln" d="M200 130 L310 220" />
          <path className="ln" d="M200 130 L200 235" />

          <circle className="nd" cx="200" cy="50" r="26" />
          <text x="200" y="20">Internet</text>

          <rect className="nd" x="172" y="106" width="56" height="48" rx="8" />
          <text x="200" y="176">Router</text>

          <rect className="nd" x="62" y="200" width="56" height="40" rx="8" />
          <text x="90" y="262">Server</text>

          <rect className="nd" x="172" y="215" width="56" height="40" rx="8" />
          <text x="200" y="277">Switch</text>

          <rect className="nd" x="282" y="200" width="56" height="40" rx="8" />
          <text x="310" y="262">Lab PCs</text>

          <circle className="pk" r="6">
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path="M200 50 L200 130 L90 220"
            />
          </circle>

          <circle className="pk" r="6">
            <animateMotion
              dur="3s"
              begin="1.5s"
              repeatCount="indefinite"
              path="M310 220 L200 130 L200 50"
            />
          </circle>
        </svg>
      </div>
    </section>
  );
}
