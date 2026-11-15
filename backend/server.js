require("dotenv").config();
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const prisma = require("./prismaClient");

const app = express();

app.use(cors());
app.use(express.json());

/* ------------------------------------------------------------------ */
/*  Admin login (simple password -> signed, expiring token)            */
/* ------------------------------------------------------------------ */
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
// If TOKEN_SECRET is not set, a random one is used (admin must log in again after a restart).
const TOKEN_SECRET =
  process.env.TOKEN_SECRET || crypto.randomBytes(32).toString("hex");
const TOKEN_LIFETIME_MS = 2 * 60 * 60 * 1000; // 2 hours

function sha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest();
}

function sign(text) {
  return crypto.createHmac("sha256", TOKEN_SECRET).update(text).digest("hex");
}

function createToken() {
  const expires = String(Date.now() + TOKEN_LIFETIME_MS);
  return `${expires}.${sign(expires)}`;
}

function isValidToken(token) {
  if (typeof token !== "string") return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature) return false;

  const expected = Buffer.from(sign(expires));
  const received = Buffer.from(signature);
  if (expected.length !== received.length) return false;
  if (!crypto.timingSafeEqual(expected, received)) return false;

  return Number(expires) > Date.now();
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!isValidToken(token)) {
    return res.status(401).json({ error: "Admin login required." });
  }
  next();
}

// Block repeated wrong passwords: 5 failures per IP every 10 minutes
const failedLogins = new Map();
const MAX_FAILS = 5;
const WINDOW_MS = 10 * 60 * 1000;

app.post("/api/admin/login", (req, res) => {
  if (!ADMIN_PASSWORD) {
    return res
      .status(503)
      .json({ error: "Admin login is not set up. Add ADMIN_PASSWORD to backend/.env." });
  }

  const ip = req.ip;
  const record = failedLogins.get(ip);
  if (record && record.count >= MAX_FAILS && Date.now() - record.first < WINDOW_MS) {
    return res.status(429).json({ error: "Too many attempts. Try again in a few minutes." });
  }

  const supplied = sha256(req.body.password || "");
  const correct = sha256(ADMIN_PASSWORD);

  if (!crypto.timingSafeEqual(supplied, correct)) {
    const fresh = !record || Date.now() - record.first >= WINDOW_MS;
    failedLogins.set(ip, {
      count: fresh ? 1 : record.count + 1,
      first: fresh ? Date.now() : record.first,
    });
    return res.status(401).json({ error: "Wrong password." });
  }

  failedLogins.delete(ip);
  res.json({ token: createToken() });
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Checks and cleans the project fields sent from the form
function cleanProject(body) {
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const technologies = String(body.technologies || "").trim();
  const project_link = String(body.project_link || "").trim();

  if (!title) return { error: "Title is required." };
  if (title.length > 150) return { error: "Title is too long (max 150)." };
  if (description.length > 5000) return { error: "Description is too long." };
  if (technologies.length > 255) return { error: "Technologies is too long (max 255)." };
  if (project_link) {
    if (project_link.length > 255) return { error: "Link is too long (max 255)." };
    if (!/^https?:\/\/\S+$/i.test(project_link)) {
      return { error: "Link must start with http:// or https://" };
    }
  }

  return {
    data: {
      title,
      description: description || null,
      technologies: technologies || null,
      project_link: project_link || null,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Public routes                                                      */
/* ------------------------------------------------------------------ */
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ status: "database unreachable" });
  }
});

// READ
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await prisma.projects.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        technologies: true,
        project_link: true,
      },
      orderBy: { id: "asc" },
    });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not load projects" });
  }
});

app.get("/api/certificates", async (req, res) => {
  try {
    const certificates = await prisma.certificates.findMany({
      orderBy: { id: "asc" },
    });
    res.json(certificates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not load certificates" });
  }
});

app.post("/api/messages", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim();
  const message = String(req.body.message || "").trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Please complete all fields." });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email." });
  }
  if (name.length > 100 || email.length > 150 || message.length > 5000) {
    return res.status(400).json({ error: "One of the fields is too long." });
  }

  try {
    await prisma.messages.create({
      data: { name, email, message },
    });
    res.status(201).json({ message: "Message saved." });
  } catch (error) {
    console.error("Database insert failed:", error);
    res.status(500).json({ error: "Could not save message." });
  }
});

/* ------------------------------------------------------------------ */
/*  Admin-only CRUD for projects                                       */
/* ------------------------------------------------------------------ */

// CREATE
app.post("/api/projects", requireAdmin, async (req, res) => {
  const { data, error } = cleanProject(req.body);
  if (error) return res.status(400).json({ error });

  try {
    const project = await prisma.projects.create({ data });
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not add project." });
  }
});

// UPDATE
app.put("/api/projects/:id", requireAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid project id." });

  const { data, error } = cleanProject(req.body);
  if (error) return res.status(400).json({ error });

  try {
    const project = await prisma.projects.update({ where: { id }, data });
    res.json(project);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Project not found." });
    }
    console.error(err);
    res.status(500).json({ error: "Could not update project." });
  }
});

// DELETE
app.delete("/api/projects/:id", requireAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid project id." });

  try {
    await prisma.projects.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Project not found." });
    }
    console.error(err);
    res.status(500).json({ error: "Could not delete project." });
  }
});


/* ------------------------------------------------------------------ */
/*  Admin-only CRUD for certificates                                   */
/* ------------------------------------------------------------------ */
function cleanCertificate(body) {
  const title = String(body.title || "").trim();
  const issuer = String(body.issuer || "").trim();
  const certificate_file = String(body.certificate_file || "").trim();
  const date_earned = String(body.date_earned || "").trim();

  if (!title) return { error: "Title is required." };
  if (title.length > 150) return { error: "Title is too long (max 150)." };
  if (issuer.length > 150) return { error: "Issuer is too long (max 150)." };
  if (certificate_file.length > 255) return { error: "File path is too long (max 255)." };

  let date = null;
  if (date_earned) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date_earned) || Number.isNaN(Date.parse(date_earned))) {
      return { error: "Date must look like 2026-03-15." };
    }
    date = new Date(`${date_earned}T00:00:00.000Z`);
  }

  return {
    data: {
      title,
      issuer: issuer || null,
      certificate_file: certificate_file || null,
      date_earned: date,
    },
  };
}

// CREATE
app.post("/api/certificates", requireAdmin, async (req, res) => {
  const { data, error } = cleanCertificate(req.body);
  if (error) return res.status(400).json({ error });
  try {
    res.status(201).json(await prisma.certificates.create({ data }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not add certificate." });
  }
});

// UPDATE
app.put("/api/certificates/:id", requireAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid certificate id." });
  const { data, error } = cleanCertificate(req.body);
  if (error) return res.status(400).json({ error });
  try {
    res.json(await prisma.certificates.update({ where: { id }, data }));
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Certificate not found." });
    console.error(err);
    res.status(500).json({ error: "Could not update certificate." });
  }
});

// DELETE
app.delete("/api/certificates/:id", requireAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid certificate id." });
  try {
    await prisma.certificates.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Certificate not found." });
    console.error(err);
    res.status(500).json({ error: "Could not delete certificate." });
  }
});

/* ------------------------------------------------------------------ */
/*  Admin-only: read and delete contact messages                       */
/* ------------------------------------------------------------------ */
app.get("/api/messages", requireAdmin, async (req, res) => {
  try {
    res.json(await prisma.messages.findMany({ orderBy: { id: "desc" } }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load messages." });
  }
});

app.delete("/api/messages/:id", requireAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid message id." });
  try {
    await prisma.messages.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Message not found." });
    console.error(err);
    res.status(500).json({ error: "Could not delete message." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD === "change-this-password") {
    console.log("WARNING: set a real ADMIN_PASSWORD in backend/.env");
  }
});
