import { useEffect, useState } from "react";
import { request } from "../api";

/* What each tab manages. Add, edit and delete are all driven by this config. */
const SECTIONS = {
  projects: {
    label: "Projects",
    canAdd: true,
    canEdit: true,
    fields: [
      { name: "title", label: "Title", required: true, max: 150 },
      { name: "description", label: "Description", textarea: true },
      { name: "technologies", label: "Technologies", max: 255, placeholder: "React, Node.js, MySQL" },
      { name: "project_link", label: "Project link (optional)", type: "url", max: 255, placeholder: "https://github.com/..." },
    ],
    summary: (r) => ({ title: r.title, text: r.description, meta: r.technologies, link: r.project_link }),
  },
  certificates: {
    label: "Certificates",
    canAdd: true,
    canEdit: true,
    fields: [
      { name: "title", label: "Title", required: true, max: 150 },
      { name: "issuer", label: "Issuer (optional)", max: 150, placeholder: "Cisco" },
      { name: "certificate_file", label: "File path (optional)", max: 255, placeholder: "/certificate/my-certificate.pdf" },
      { name: "date_earned", label: "Date earned (optional)", type: "date" },
    ],
    summary: (r) => ({
      title: r.title,
      text: [r.issuer, r.date_earned && String(r.date_earned).slice(0, 10)].filter(Boolean).join(" · "),
      meta: r.certificate_file,
    }),
  },
  messages: {
    label: "Messages",
    canAdd: false,
    canEdit: false,
    fields: [],
    summary: (r) => ({
      title: `${r.name} (${r.email})`,
      text: r.message,
      meta: r.created_at && new Date(r.created_at).toLocaleString(),
    }),
  },
};

function emptyForm(config) {
  return Object.fromEntries(config.fields.map((f) => [f.name, ""]));
}

function formFromRow(config, row) {
  const form = { id: row.id };
  config.fields.forEach((f) => {
    const value = row[f.name] ?? "";
    form[f.name] = f.type === "date" ? String(value).slice(0, 10) : value;
  });
  return form;
}

function Manager({ name, token, onExpired }) {
  const config = SECTIONS[name];
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [form, setForm] = useState(null); // null = hidden
  const [message, setMessage] = useState("");

  function handleError(error) {
    if (error.status === 401) onExpired();
    else setMessage(error.message);
  }

  async function load() {
    try {
      setRows(await request(`/api/${name}`, { token }));
      setStatus("ready");
    } catch (error) {
      if (error.status === 401) onExpired();
      else setStatus("error");
    }
  }

  useEffect(() => {
    setStatus("loading");
    setForm(null);
    setMessage("");
    load();
  }, [name]);

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");
    const { id, ...fields } = form;
    try {
      if (id) {
        await request(`/api/${name}/${id}`, { method: "PUT", body: fields, token });
        setMessage("Saved changes.");
      } else {
        await request(`/api/${name}`, { method: "POST", body: fields, token });
        setMessage("Added.");
      }
      setForm(null);
      await load();
    } catch (error) {
      handleError(error);
    }
  }

  async function handleDelete(row) {
    const label = config.summary(row).title;
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setMessage("");
    try {
      await request(`/api/${name}/${row.id}`, { method: "DELETE", token });
      setMessage("Deleted.");
      await load();
    } catch (error) {
      handleError(error);
    }
  }

  return (
    <div>
      <div className="admin-bar">
        {config.canAdd && (
          <button type="button" className="btn small" onClick={() => setForm(emptyForm(config))}>
            + Add {config.label.toLowerCase().replace(/s$/, "")}
          </button>
        )}
        <span style={{ color: "var(--mute)" }}>{rows.length} total</span>
      </div>

      {form && (
        <form className="admin-form" onSubmit={handleSave}>
          <h3>{form.id ? "Edit" : "Add"} {config.label.toLowerCase().replace(/s$/, "")}</h3>
          {config.fields.map((f) => (
            <label key={f.name}>
              {f.label}
              {f.textarea ? (
                <textarea
                  rows={4}
                  value={form[f.name]}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                />
              ) : (
                <input
                  type={f.type || "text"}
                  value={form[f.name]}
                  maxLength={f.max}
                  required={f.required}
                  placeholder={f.placeholder}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                />
              )}
            </label>
          ))}
          <div className="btns" style={{ marginTop: 0 }}>
            <button type="submit" className="btn small">{form.id ? "Save changes" : "Add"}</button>
            <button type="button" className="btn small alt" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      )}

      {message && <p className="admin-message">{message}</p>}
      {status === "loading" && <p>Loading...</p>}
      {status === "error" && <p>Could not load data. Check that the backend is running.</p>}
      {status === "ready" && rows.length === 0 && <p>Nothing here yet.</p>}

      <div className="admin-list">
        {rows.map((row) => {
          const s = config.summary(row);
          return (
            <article className="card admin-row" key={row.id}>
              <div>
                <h3>{s.title}</h3>
                {s.text && <p style={{ whiteSpace: "pre-wrap" }}>{s.text}</p>}
                {s.meta && <div className="tags">{s.meta}</div>}
              </div>
              <div className="card-actions" style={{ marginTop: 0 }}>
                {config.canEdit && (
                  <button type="button" className="btn small alt" onClick={() => setForm(formFromRow(config, row))}>
                    Edit
                  </button>
                )}
                <button type="button" className="btn small danger" onClick={() => handleDelete(row)}>
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default function Admin({ theme, onToggleTheme }) {
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem("adminToken") || "";
    } catch {
      return "";
    }
  });
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState("projects");

  function logout(text = "") {
    setToken("");
    setLoginError(text);
    try {
      sessionStorage.removeItem("adminToken");
    } catch {}
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    try {
      const result = await request("/api/admin/login", { method: "POST", body: { password } });
      setToken(result.token);
      try {
        sessionStorage.setItem("adminToken", result.token);
      } catch {}
      setPassword("");
    } catch (error) {
      setLoginError(error.message);
    }
  }

  return (
    <>
      <header>
        <nav aria-label="Admin">
          <a className="logo" href="/">Admin Panel</a>
          <div className="links">
            <a href="/">← Back to portfolio</a>
            {token && (
              <a
                href="#logout"
                onClick={(e) => {
                  e.preventDefault();
                  logout("Logged out.");
                }}
              >
                Log out
              </a>
            )}
          </div>
          <button id="theme" type="button" onClick={onToggleTheme}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </nav>
      </header>

      <main>
        <section className="admin-page">
          {!token ? (
            <>
              <h2>Admin login</h2>
              <p className="lead">Enter the admin password to manage your portfolio content.</p>
              <form className="admin-form" onSubmit={handleLogin}>
                <label>
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </label>
                {loginError && <p className="admin-message" style={{ margin: 0 }}>{loginError}</p>}
                <button type="submit" className="btn small">Log in</button>
              </form>
            </>
          ) : (
            <>
              <h2>Manage content</h2>
              <p className="lead">Changes are saved to your MySQL database and show on the portfolio right away.</p>

              <div className="admin-tabs" role="tablist">
                {Object.entries(SECTIONS).map(([key, s]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={tab === key}
                    className={`btn small${tab === key ? "" : " alt"}`}
                    onClick={() => setTab(key)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <Manager key={tab} name={tab} token={token} onExpired={() => logout("Your login expired. Please log in again.")} />
            </>
          )}
        </section>
      </main>
    </>
  );
}
