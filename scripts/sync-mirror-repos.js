import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import yaml from "js-yaml";

const GH_TOKEN = process.env.GH_TOKEN;
if (!GH_TOKEN) throw new Error("GH_TOKEN is not set");

const changedFilesArg = process.argv[2];
if (!changedFilesArg) {
  console.error("Usage: node scripts/sync-mirror-repos.js 'articles/a.md articles/b.md'");
  process.exit(1);
}
const changedFiles = changedFilesArg.split(/\s+/).filter(Boolean);

const config = yaml.load(fs.readFileSync("config/platforms.yml", "utf8"));
const mirrors = config.mirror_repos || [];

async function upsertFile(owner, repo, targetPath, content) {
  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${targetPath}`;
  const headers = {
    Authorization: `Bearer ${GH_TOKEN}`,
    "Content-Type": "application/json",
    "User-Agent": "aws-content-relay-hub-sync",
  };

  let sha = undefined;
  const getRes = await fetch(apiBase, { headers });
  if (getRes.status === 200) {
    const json = await getRes.json();
    sha = json.sha;
  }

  const body = {
    message: `Sync article ${targetPath} from aws-content-relay-hub`,
    content: Buffer.from(content).toString("base64"),
    sha,
  };

  const putRes = await fetch(apiBase, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const text = await putRes.text();
    throw new Error(
      `Failed to upsert ${owner}/${repo}:${targetPath} - ${putRes.status} ${text}`
    );
  }

  const json = await putRes.json();
  console.log("Synced:", json.content.path, "->", `${owner}/${repo}`);
}

(async () => {
  for (const file of changedFiles) {
    const content = fs.readFileSync(file, "utf8");
    const baseName = path.basename(file);

    for (const mirror of mirrors) {
      const targetPath = path.posix.join(mirror.target_path, baseName);
      console.log(
        `Syncing ${file} to ${mirror.owner}/${mirror.name}:${targetPath}`
      );
      await upsertFile(mirror.owner, mirror.name, targetPath, content);
    }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
