import fs from "fs";
import path from "path";
import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GH_TOKEN });

// ---------------------------------------------------------
// Read CLI args
// ---------------------------------------------------------
const changedFiles = process.argv[2];
const mappingRaw = process.argv[3];

if (!changedFiles) {
  console.log("No changed files passed.");
  process.exit(0);
}

if (!mappingRaw) {
  console.log("No repo mapping provided.");
  process.exit(0);
}

// ---------------------------------------------------------
// Parse mapping: owner/repo:destinationPath
// Example: x-engineer/docs:/
// ---------------------------------------------------------
const mappings = mappingRaw
  .split("\n")
  .map(line => line.trim())
  .filter(Boolean)
  .map(line => {
    const [repo, dest] = line.split(":");
    const [owner, name] = repo.split("/");
    return { owner, repo: name, dest: dest || "/" };
  });

console.log("Mappings:", mappings);

// ---------------------------------------------------------
// Sync each changed file to each mapped repo
// ---------------------------------------------------------
async function syncFileToRepo(filePath, { owner, repo, dest }) {
  const fileContent = await fs.promises.readFile(filePath);
  const base64Content = Buffer.from(fileContent).toString("base64");

  // Destination path (root-level sync)
  const filename = path.basename(filePath);
  const targetPath = dest === "/" ? filename : `${dest}${filename}`;

  console.log(`→ Syncing ${filePath} to ${owner}/${repo}/${targetPath}`);

  try {
    // Check if file exists in target repo
    let sha = undefined;
    try {
      const existing = await octokit.request(
        "GET /repos/{owner}/{repo}/contents/{path}",
        { owner, repo, path: targetPath }
      );
      sha = existing.data.sha;
    } catch (err) {
      // File does not exist — ignore
    }

    // Push file
    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path: targetPath,
      message: `Sync JP article: ${filename}`,
      content: base64Content,
      sha
    });

    console.log(`✔ Synced: ${owner}/${repo}/${targetPath}`);
  } catch (err) {
    console.error(`✖ Failed syncing ${filePath} → ${owner}/${repo}`, err);
  }
}

// ---------------------------------------------------------
// Main execution
// ---------------------------------------------------------
async function run() {
  const files = changedFiles.split(" ").filter(Boolean);

  for (const file of files) {
    for (const map of mappings) {
      await syncFileToRepo(file, map);
    }
  }
}

run();
