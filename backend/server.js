import express from "express";
import cors from "cors";
import { readFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";
import { expressjwt } from "express-jwt";
import { expressJwtSecret } from "jwks-rsa";
import { loadFamily, addPerson, editPerson, removePerson } from "./xmlTools.js";
 
const parser = new XMLParser({
  parseTagValue: false,
  isArray: (_name, path) => path === "admins.admin",
});
 
async function loadAdmins() {
  const xml = await readFile(new URL("./Admins.xml", import.meta.url), "utf8");
  return parser.parse(xml).admins?.admin ?? [];
}
 
const requireGoogleToken = expressjwt({
  secret: expressJwtSecret({
    jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
    cache: true,
    rateLimit: true,
  }),
  audience: process.env.GOOGLE_CLIENT_ID,
  issuer: ["https://accounts.google.com", "accounts.google.com"],
  algorithms: ["RS256"],
});
 
const requireAdmin = async (req, res, next) => {
  const admins = await loadAdmins();
  const admin = admins.find((a) => String(a.googleUserId).trim() === req.auth.sub);
  if (!admin) return res.sendStatus(403);
  req.treeNumber = String(admin.treeNumber).trim();
  next();
};
 
const api = express.Router();
api.use(requireGoogleToken, requireAdmin);
 
api.post("/auth/verify", (req, res) => res.json({ treeNumber: req.treeNumber }));
api.get("/people", async (req, res) => res.json(await loadFamily(req.treeNumber)));
api.post("/people", async (req, res) => res.status(201).json(await addPerson(req.body, req.treeNumber)));
api.patch("/people/:id", async (req, res) => res.json(await editPerson(req.params.id, req.body, req.treeNumber)));
api.delete("/people/:id", async (req, res) => res.json(await removePerson(req.params.id, req.body, req.treeNumber)));
 
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", api);
app.listen(3000);
 