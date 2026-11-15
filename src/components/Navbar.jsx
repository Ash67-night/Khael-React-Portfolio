export default function Navbar({ theme, onToggleTheme }) {
  return (
    <header>
      <nav aria-label="Main">
        <a className="logo" href="#home">Portfolio</a>

        <div className="links">
          <a href="/admin">Admin</a>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#education">Education</a>
          <a href="#achievements">Achievements</a>
          <a href="#resume">Resume</a>
          <a href="#contact">Contact</a>
        </div>

        <button
          id="theme"
          type="button"
          aria-label="Toggle light or dark theme"
          onClick={onToggleTheme}
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </nav>
    </header>
  );
}
