import { readFile, readdir } from "node:fs/promises"; import path from "node:path";
const roots = ["app", "components", "public"]; const forbiddenSecretPattern = /sk-[A-Za-z0-9_-]{20,}|PAYPAL_CLIENT_SECRET\s*=\s*[^\s#]+|OPENAI_API_KEY\s*=\s*[^\s#]+/;
async function files(directory) { const entries = await readdir(directory, { withFileTypes: true }); const output = []; for (const entry of entries) { const target = path.join(directory, entry.name); if (entry.isDirectory()) output.push(...await files(target)); else output.push(target); } return output; }
for (const root of roots) for (const file of await files(root)) { const content = await readFile(file, "utf8").catch(() => ""); if (forbiddenSecretPattern.test(content)) { console.error(`Secret potentiel détecté dans ${file}`); process.exitCode = 1; } }
if (!process.exitCode) console.log("Aucun secret en clair détecté dans les surfaces publiques.");
