import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import yaml from "js-yaml";

const QIITA_TOKEN = process.env.QIITA_TOKEN;
if (!QIITA_TOKEN) throw new Error("QIITA_TOKEN is not set");

type Frontmatter = {
  title: string;
  tags?: string[];
  private?: boolean;
  qiita_id?: string | null;
};

function parseFrontmatter(raw: string): { meta: Frontmatter; body: string } | null {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const meta: any = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (!kv) continue;
    const key = kv[1];
    let value = kv[2].trim();

    if (value.startsWith("[") && value.endsWith("]")) {
      value = value.slice(1, -1);
      meta[key] = value.split(",").map((v) => v.trim());
    } else if (value === "true" || value === "false") {
      meta[key] = value === "true";
    } else {
      meta[key] = value.replace(/^["']|["']$/g, "");
    }
  }

  return { meta: meta as Frontmatter, body: match[2].trim() };
}

async function postToQiita(articlePath: string) {
  const fullPath = path.resolve(articlePath);
  const raw = fs.readFileSync(fullPath, "utf8");
  const parsed = parseFrontmatter(raw);
  if (!parsed) {
    console.warn(`Skipping ${articlePath}: no frontmatter found`);
    return;
  }
  const { meta, body } = parsed;

  if (meta.qiita_id && meta.qiita_id !== "null") {
    console.log(`Skipping ${articlePath}: already posted (qiita_id: ${meta.qiita_id})`);
    return;
  }

  const qiitaBody =
    body +
    `\n\n---\n> この投稿は GitHub リポジトリ "aws-content-relay-hub" から自動投稿されています。\n`;

  const res = await fetch("https://qiita.com/api/v2/items", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${QIITA_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: meta.title,
      tags: (meta.tags || []).map((t) => ({ name: t })),
      body: qiitaBody,
      private: meta.private ?? false,
    }),
  });

  if (!res.ok) throw new Error(`Qiita POST failed: ${res.status}`);

  const json: any = await res.json();
  console.log("Posted to Qiita:", json.id, json.url);

  const mappingPath = path.resolve("config/mapping.yml");
  const mapping: any = yaml.load(fs.readFileSync(mappingPath, "utf8")) ?? { articles: {} };
  const filename = path.basename(articlePath);
  mapping.articles ??= {};
  mapping.articles[filename] ??= {};
  mapping.articles[filename].qiita_id = json.id;
  fs.writeFileSync(mappingPath, yaml.dump(mapping));
  console.log(`Updated mapping.yml: ${filename} → ${json.id}`);
}

const articlePath = process.argv[2];
if (!articlePath) {
  console.error("Usage: ts-node scripts/qiita-post.ts articles/xxx.md");
  process.exit(1);
}

postToQiita(articlePath).catch((e) => {
  console.error(e);
  process.exit(1);
});
