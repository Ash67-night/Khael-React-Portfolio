import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Education from "./components/Education";
import Achievements from "./components/Achievements";
import Resume from "./components/Resume";
import Contact from "./components/Contact";
import Admin from "./components/Admin";

export default function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  const isAdminPage = window.location.pathname.replace(/\/+$/, "") === "/admin";
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  if (isAdminPage) {
    return <Admin theme={theme} onToggleTheme={toggleTheme} />;
  }

  return (
    <>
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main>
        <Home />
        <About />
        <Skills />
        <Projects />
        <Education />
        <Achievements />
        <Resume />
        <Contact />
      </main>

      <footer>Personal Portfolio</footer>
    </>
  );
}
