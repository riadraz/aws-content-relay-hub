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
};

function parseFrontmatter(raw: string): { meta: Frontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Frontmatter not found");
  return { meta: yaml.load(match[1]) as Frontmatter, body: match[2].trim() };
}

function getMapping(): any {
  const mappingPath = path.resolve("config/mapping.yml");
  return (yaml.load(fs.readFileSync(mappingPath, "utf8")) as any) ?? { articles: {} };
}

function saveMapping(mapping: any) {
  fs.writeFileSync(path.resolve("config/mapping.yml"), yaml.dump(mapping));
}

async function syncToQiita(articlePath: string) {
  const raw = fs.readFileSync(path.resolve(articlePath), "utf8");
  const { meta, body } = parseFrontmatter(raw);
  const filename = path.basename(articlePath);
  const mapping = getMapping();
  const existingId = mapping.articles?.[filename]?.qiita_id;

  const qiitaBody = body + `\n\n---\n> この投稿は GitHub リポジトリ "aws-content-relay-hub" から自動投稿されています。\n`;
  const payload = {
    title: meta.title,
    tags: (meta.tags || []).map((t) => ({ name: t })),
    body: qiitaBody,
    private: meta.private ?? false,
  };

  if (existingId && existingId !== "null") {
    // UPDATE
    console.log(`Updating Qiita article: ${filename} (${existingId})`);
    const res = await fetch(`https://qiita.com/api/v2/items/${existingId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${QIITA_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Qiita PATCH failed: ${res.status} ${await res.text()}`);
    const json: any = await res.json();
    console.log("Updated:", json.url);
  } else {
    // CREATE
    console.log(`Creating Qiita article: ${filename}`);
    const res = await fetch("https://qiita.com/api/v2/items", {
      method: "POST",
      headers: { Authorization: `Bearer ${QIITA_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Qiita POST failed: ${res.status} ${await res.text()}`);
    const json: any = await res.json();
    console.log("Created:", json.url);

    // Save new qiita_id to mapping.yml
    mapping.articles ??= {};
    mapping.articles[filename] ??= {};
    mapping.articles[filename].qiita_id = json.id;
    saveMapping(mapping);
    console.log(`Updated mapping.yml: ${filename} → ${json.id}`);
  }
}

const articlePath = process.argv[2];
if (!articlePath) {
  console.error("Usage: npx tsx scripts/qiita-sync.ts articles/xxx.md");
  process.exit(1);
}

syncToQiita(articlePath).catch((e) => {
  console.error(e);
  process.exit(1);
});
